using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs.Sandbox;

namespace VisualizationDSA.Infrastructure.Services
{
    public class SandboxService : ISandboxService
    {
        private readonly HttpClient _httpClient;
        private readonly string _sandboxUrl;

        public SandboxService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _sandboxUrl = config["Judge0SandboxUrl"] ?? "http://localhost:2359";
        }

        public async Task<SandboxResult> ExecuteAsync(string sourceCode, string language)
        {
            var lines = sourceCode.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
            if (lines.Length > 200)
                return SandboxResult.CreateError("CODE_TOO_LONG", "Tối đa 200 dòng code");

            string instrumentedCode;
            int languageId;

            var lang = language.ToLower();
            if (lang == "python")
            {
                languageId = 71; // Python 3
                instrumentedCode = GetPythonInstrumentedCode(sourceCode);
            }
            else if (lang == "javascript" || lang == "js")
            {
                languageId = 93; // Node.js (or 63)
                instrumentedCode = GetJsInstrumentedCode(sourceCode);
            }
            else if (lang == "java")
            {
                languageId = 62; // Java
                instrumentedCode = GetJavaInstrumentedCode(sourceCode);
            }
            else if (lang == "c++" || lang == "cpp")
            {
                languageId = 54; // C++
                instrumentedCode = GetCppInstrumentedCode(sourceCode);
            }
            else
            {
                return SandboxResult.CreateError("UNSUPPORTED_LANGUAGE", $"Ngôn ngữ {language} chưa được hỗ trợ tracing.");
            }

            var submission = new
            {
                source_code = instrumentedCode,
                language_id = languageId,
                cpu_time_limit = 10.0,
                memory_limit = 65536 // 64MB
            };

            var content = new StringContent(JsonSerializer.Serialize(submission), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{_sandboxUrl}/submissions?base64_encoded=false&wait=true", content);

            if (!response.IsSuccessStatusCode)
            {
                return SandboxResult.CreateError("SANDBOX_ERROR", "Lỗi kết nối tới hệ thống Sandbox.");
            }

            var jsonString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(jsonString);
            var root = doc.RootElement;

            var statusId = root.GetProperty("status").GetProperty("id").GetInt32();
            
            // Timeout
            if (statusId == 13)
            {
                return SandboxResult.CreateError("TIMEOUT", "Code chạy quá 10 giây. Kiểm tra lại vòng lặp.");
            }
            // Memory Limit Exceeded
            if (statusId == 12)
            {
                return SandboxResult.CreateError("MEMORY_EXCEEDED", "Code sử dụng quá 64MB bộ nhớ.");
            }
            // Compilation Error or Runtime Error
            if (statusId == 11 || statusId == 6)
            {
                var stderr = root.TryGetProperty("stderr", out var errElement) && errElement.ValueKind == JsonValueKind.String 
                    ? errElement.GetString() : "Runtime error.";
                return SandboxResult.CreateError("RUNTIME_ERROR", stderr ?? "Runtime error.");
            }

            var stdout = root.TryGetProperty("stdout", out var outElement) && outElement.ValueKind == JsonValueKind.String 
                ? outElement.GetString() : string.Empty;

            if (string.IsNullOrEmpty(stdout))
                return SandboxResult.CreateError("NO_OUTPUT", "Không lấy được kết quả từ Sandbox.");

            var trace = ParseExecutionTrace(stdout);
            if (trace == null)
            {
                var errorOutput = stdout.Replace("---TRACE_START---", "").Replace("---TRACE_END---", "").Trim();
                return SandboxResult.CreateError("PARSE_ERROR", $"Lỗi khi parse trace. Output: {errorOutput}");
            }

            return SandboxResult.CreateSuccess(trace);
        }

        private string GetPythonInstrumentedCode(string sourceCode)
        {
            var sb = new StringBuilder();
            sb.AppendLine("import sys");
            sb.AppendLine("import json");
            sb.AppendLine("import copy");
            sb.AppendLine("");
            sb.AppendLine("_trace_output = []");
            sb.AppendLine("_step_count = 0");
            sb.AppendLine("");
            sb.AppendLine("def trace_calls(frame, event, arg):");
            sb.AppendLine("    global _step_count");
            sb.AppendLine("    if event != 'line': return trace_calls");
            sb.AppendLine("    if frame.f_code.co_filename != '<string>': return trace_calls");
            sb.AppendLine("");
            sb.AppendLine("    local_vars = frame.f_locals");
            sb.AppendLine("    line_no = frame.f_lineno");
            sb.AppendLine("    clean_vars = {}");
            sb.AppendLine("    array_state = []");
            sb.AppendLine("    for k, v in local_vars.items():");
            sb.AppendLine("        if k.startswith('_') or k in ('sys', 'json', 'copy', 'trace_calls'): continue");
            sb.AppendLine("        if isinstance(v, list):");
            sb.AppendLine("            array_state = copy.deepcopy(v)");
            sb.AppendLine("            clean_vars[k] = array_state");
            sb.AppendLine("        elif isinstance(v, (int, float, str, bool)):");
            sb.AppendLine("            clean_vars[k] = v");
            sb.AppendLine("");
            sb.AppendLine("    _trace_output.append({");
            sb.AppendLine("        'Step': _step_count,");
            sb.AppendLine("        'Line': line_no,");
            sb.AppendLine("        'Variables': clean_vars,");
            sb.AppendLine("        'ArrayState': array_state,");
            sb.AppendLine("        'HighlightIndices': [],");
            sb.AppendLine("        'SwapEvent': None,");
            sb.AppendLine("        'CallStack': [frame.f_code.co_name]");
            sb.AppendLine("    })");
            sb.AppendLine("    _step_count += 1");
            sb.AppendLine("    return trace_calls");
            sb.AppendLine("");
            sb.AppendLine("def run_user_code():");
            sb.AppendLine("    user_code = \"\"\"");
            // Escape user code
            sb.AppendLine(sourceCode.Replace("\"", "\\\""));
            sb.AppendLine("\"\"\"");
            sb.AppendLine("    try:");
            sb.AppendLine("        compiled = compile(user_code, '<string>', 'exec')");
            sb.AppendLine("        sys.settrace(trace_calls)");
            sb.AppendLine("        exec(compiled, {})");
            sb.AppendLine("        sys.settrace(None)");
            sb.AppendLine("    except Exception as e:");
            sb.AppendLine("        sys.settrace(None)");
            sb.AppendLine("        print('ERROR:', str(e))");
            sb.AppendLine("    print('---TRACE_START---')");
            sb.AppendLine("    print(json.dumps(_trace_output))");
            sb.AppendLine("    print('---TRACE_END---')");
            sb.AppendLine("");
            sb.AppendLine("run_user_code()");

            return sb.ToString();
        }

        private string GetJsInstrumentedCode(string sourceCode)
        {
            var lines = sourceCode.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
            var sb = new StringBuilder();
            
            sb.AppendLine("let _step_count = 0;");
            sb.AppendLine("const _trace_output = [];");
            sb.AppendLine("const _vars = {};");
            sb.AppendLine("let _global_arr = [];");
            sb.AppendLine("function _record_trace(line) {");
            sb.AppendLine("  _trace_output.push({");
            sb.AppendLine("    Step: _step_count++, Line: line, Variables: JSON.parse(JSON.stringify(_vars)), ArrayState: JSON.parse(JSON.stringify(_global_arr)), HighlightIndices: [], SwapEvent: null, CallStack: ['main']");
            sb.AppendLine("  });");
            sb.AppendLine("}");
            sb.AppendLine("function runUserCode() {");

            for (int i = 0; i < lines.Length; i++)
            {
                var originalLine = lines[i];
                var lineNo = i + 1;
                string newLine = originalLine;
                
                if (System.Text.RegularExpressions.Regex.IsMatch(newLine, @"\barr\s*=")) {
                    newLine += $" _global_arr = arr; _record_trace({lineNo});";
                }
                else if (System.Text.RegularExpressions.Regex.IsMatch(newLine, @"\barr\[.*?\]\s*(?:[-+*/%]=|=)(?!=)")) {
                    newLine += $" _record_trace({lineNo});";
                }
                
                var assignMatch = System.Text.RegularExpressions.Regex.Match(newLine, @"\b([a-zA-Z_]\w*)\s*(?:[-+*/%]=|=)(?!=)");
                if (assignMatch.Success && !newLine.Contains("for") && assignMatch.Groups[1].Value != "arr") {
                    string varName = assignMatch.Groups[1].Value;
                    newLine += $" _vars['{varName}'] = {varName}; _record_trace({lineNo});";
                }

                var incMatch = System.Text.RegularExpressions.Regex.Match(newLine, @"\b([a-zA-Z_]\w*)\s*(?:\+\+|--)");
                if (incMatch.Success && !newLine.Contains("for")) {
                    string varName = incMatch.Groups[1].Value;
                    newLine += $" _vars['{varName}'] = {varName}; _record_trace({lineNo});";
                }

                var forMatch = System.Text.RegularExpressions.Regex.Match(newLine, @"for\s*\(\s*(?:let\s+|const\s+|var\s+)?([a-zA-Z_]\w*)\s*=");
                if (forMatch.Success && newLine.Contains("{")) {
                    string varName = forMatch.Groups[1].Value;
                    newLine = newLine.Replace("{", $"{{ _vars['{varName}'] = {varName}; _record_trace({lineNo});");
                }
                
                sb.AppendLine(newLine);
            }
            
            sb.AppendLine("}");
            sb.AppendLine("try { runUserCode(); } catch(e) {}");
            sb.AppendLine("console.log('---TRACE_START---');");
            sb.AppendLine("console.log(JSON.stringify(_trace_output));");
            sb.AppendLine("console.log('---TRACE_END---');");

            return sb.ToString();
        }

        private string GetJavaInstrumentedCode(string sourceCode)
        {
            var lines = sourceCode.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
            var sb = new StringBuilder();
            
            sb.AppendLine("import java.util.*;");
            sb.AppendLine("public class Main {");
            sb.AppendLine("  static int _step_count = 0;");
            sb.AppendLine("  static List<String> _trace_output = new ArrayList<>();");
            sb.AppendLine("  static Map<String, Integer> _vars = new HashMap<>();");
            sb.AppendLine("  static int[] _global_arr = new int[0];");
            sb.AppendLine("  static void _record_trace(int line) {");
            sb.AppendLine("    StringBuilder s = new StringBuilder();");
            sb.AppendLine("    s.append(\"{\\\"Step\\\":\").append(_step_count++).append(\",\\\"Line\\\":\").append(line);");
            sb.AppendLine("    s.append(\",\\\"Variables\\\":{\");");
            sb.AppendLine("    int c = 0; for (Map.Entry<String, Integer> e : _vars.entrySet()) { if (c++>0) s.append(\",\"); s.append(\"\\\"\").append(e.getKey()).append(\"\\\":\").append(e.getValue()); }");
            sb.AppendLine("    s.append(\"},\\\"ArrayState\\\":\").append(Arrays.toString(_global_arr));");
            sb.AppendLine("    s.append(\",\\\"HighlightIndices\\\":[],\\\"SwapEvent\\\":null,\\\"CallStack\\\":[\\\"main\\\"]}\");");
            sb.AppendLine("    _trace_output.add(s.toString());");
            sb.AppendLine("  }");
            sb.AppendLine("  public static void main(String[] args) {");
            sb.AppendLine("    try { runUserCode(); } catch(Exception e) {}");
            sb.AppendLine("    System.out.println(\"---TRACE_START---\");");
            sb.AppendLine("    System.out.println(\"[\" + String.join(\",\", _trace_output) + \"]\");");
            sb.AppendLine("    System.out.println(\"---TRACE_END---\");");
            sb.AppendLine("  }");
            sb.AppendLine("  static void runUserCode() {");

            for (int i = 0; i < lines.Length; i++)
            {
                var originalLine = lines[i];
                var lineNo = i + 1;
                string newLine = originalLine;
                
                if (System.Text.RegularExpressions.Regex.IsMatch(newLine, @"\barr\s*=")) {
                    newLine += $" _global_arr = arr; _record_trace({lineNo});";
                }
                else if (System.Text.RegularExpressions.Regex.IsMatch(newLine, @"\barr\[.*?\]\s*(?:[-+*/%]=|=)(?!=)")) {
                    newLine += $" _record_trace({lineNo});";
                }
                
                var assignMatch = System.Text.RegularExpressions.Regex.Match(newLine, @"\b([a-zA-Z_]\w*)\s*(?:[-+*/%]=|=)(?!=)");
                if (assignMatch.Success && !newLine.Contains("for") && assignMatch.Groups[1].Value != "arr") {
                    string varName = assignMatch.Groups[1].Value;
                    newLine += $" _vars.put(\"{varName}\", (int){varName}); _record_trace({lineNo});";
                }

                var incMatch = System.Text.RegularExpressions.Regex.Match(newLine, @"\b([a-zA-Z_]\w*)\s*(?:\+\+|--)");
                if (incMatch.Success && !newLine.Contains("for")) {
                    string varName = incMatch.Groups[1].Value;
                    newLine += $" _vars.put(\"{varName}\", (int){varName}); _record_trace({lineNo});";
                }

                var forMatch = System.Text.RegularExpressions.Regex.Match(newLine, @"for\s*\(\s*(?:int\s+)?([a-zA-Z_]\w*)\s*=");
                if (forMatch.Success && newLine.Contains("{")) {
                    string varName = forMatch.Groups[1].Value;
                    newLine = newLine.Replace("{", $"{{ _vars.put(\"{varName}\", (int){varName}); _record_trace({lineNo});");
                }
                
                sb.AppendLine(newLine);
            }
            
            sb.AppendLine("  }");
            sb.AppendLine("}");

            return sb.ToString();
        }

        private string GetCppInstrumentedCode(string sourceCode)
        {
            var lines = sourceCode.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
            var sb = new StringBuilder();
            
            sb.AppendLine("#include <iostream>");
            sb.AppendLine("#include <vector>");
            sb.AppendLine("#include <string>");
            sb.AppendLine("#include <map>");
            sb.AppendLine("using namespace std;");
            sb.AppendLine("int _step_count = 0;");
            sb.AppendLine("vector<string> _trace_output;");
            sb.AppendLine("map<string, int> _vars;");
            sb.AppendLine("vector<int> _global_arr;");
            sb.AppendLine("void _record_trace(int line) {");
            sb.AppendLine("  string s = \"{\\\"Step\\\":\" + to_string(_step_count++) + \",\\\"Line\\\":\" + to_string(line);");
            sb.AppendLine("  s += \",\\\"Variables\\\":{\";");
            sb.AppendLine("  int c = 0; for (auto const& [key, val] : _vars) { if (c++>0) s += \",\"; s += \"\\\"\" + key + \"\\\":\" + to_string(val); }");
            sb.AppendLine("  s += \"},\\\"ArrayState\\\":[\";");
            sb.AppendLine("  for (size_t i=0; i<_global_arr.size(); i++) { if (i>0) s += \",\"; s += to_string(_global_arr[i]); }");
            sb.AppendLine("  s += \"],\\\"HighlightIndices\\\":[],\\\"SwapEvent\\\":null,\\\"CallStack\\\":[\\\"main\\\"]}\";");
            sb.AppendLine("  _trace_output.push_back(s);");
            sb.AppendLine("}");
            sb.AppendLine("void runUserCode() {");

            for (int i = 0; i < lines.Length; i++)
            {
                var originalLine = lines[i];
                var lineNo = i + 1;
                string newLine = originalLine;
                
                if (System.Text.RegularExpressions.Regex.IsMatch(newLine, @"\barr\s*=")) {
                    newLine += $" _global_arr = arr; _record_trace({lineNo});";
                }
                else if (System.Text.RegularExpressions.Regex.IsMatch(newLine, @"\barr\[.*?\]\s*(?:[-+*/%]=|=)(?!=)")) {
                    newLine += $" _record_trace({lineNo});";
                }
                
                var assignMatch = System.Text.RegularExpressions.Regex.Match(newLine, @"\b([a-zA-Z_]\w*)\s*(?:[-+*/%]=|=)(?!=)");
                if (assignMatch.Success && !newLine.Contains("for") && assignMatch.Groups[1].Value != "arr") {
                    string varName = assignMatch.Groups[1].Value;
                    newLine += $" _vars[\"{varName}\"] = (int){varName}; _record_trace({lineNo});";
                }

                var incMatch = System.Text.RegularExpressions.Regex.Match(newLine, @"\b([a-zA-Z_]\w*)\s*(?:\+\+|--)");
                if (incMatch.Success && !newLine.Contains("for")) {
                    string varName = incMatch.Groups[1].Value;
                    newLine += $" _vars[\"{varName}\"] = (int){varName}; _record_trace({lineNo});";
                }

                var forMatch = System.Text.RegularExpressions.Regex.Match(newLine, @"for\s*\(\s*(?:int\s+)?([a-zA-Z_]\w*)\s*=");
                if (forMatch.Success && newLine.Contains("{")) {
                    string varName = forMatch.Groups[1].Value;
                    newLine = newLine.Replace("{", $"{{ _vars[\"{varName}\"] = (int){varName}; _record_trace({lineNo});");
                }
                
                sb.AppendLine(newLine);
            }
            
            sb.AppendLine("}");
            sb.AppendLine("int main() {");
            sb.AppendLine("  try { runUserCode(); } catch(...) {}");
            sb.AppendLine("  cout << \"---TRACE_START---\\n[\";");
            sb.AppendLine("  for (size_t i=0; i<_trace_output.size(); i++) { if (i>0) cout << \",\"; cout << _trace_output[i]; }");
            sb.AppendLine("  cout << \"]\\n---TRACE_END---\\n\";");
            sb.AppendLine("  return 0;");
            sb.AppendLine("}");

            return sb.ToString();
        }

        private List<ExecutionTraceStep>? ParseExecutionTrace(string stdout)
        {
            var startToken = "---TRACE_START---";
            var endToken = "---TRACE_END---";
            var startIndex = stdout.IndexOf(startToken);
            var endIndex = stdout.IndexOf(endToken);

            if (startIndex == -1 || endIndex == -1 || startIndex >= endIndex)
                return null;

            startIndex += startToken.Length;
            var json = stdout.Substring(startIndex, endIndex - startIndex).Trim();

            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<List<ExecutionTraceStep>>(json, options);
            }
            catch
            {
                return null;
            }
        }
    }
}
