using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using VisualizationDSA.Application.Common.Interfaces;

namespace VisualizationDSA.Infrastructure.Services
{
    public class AiAssistantService : IAiAssistantService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public AiAssistantService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"];
        }

        public async Task<string> GenerateContentAsync(string prompt)
        {
            if (string.IsNullOrEmpty(_apiKey) || _apiKey == "MOCK_KEY" || _apiKey == "YOUR_GEMINI_API_KEY")
            {
                // Fallback nếu không có key
                return "Hệ thống AI hiện đang bảo trì hoặc chưa được cấu hình API Key. Vui lòng thử lại sau!";
            }

            var requestUri = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                systemInstruction = new
                {
                    parts = new[]
                    {
                        new { text = "You are a helpful teaching assistant for a Data Structures and Algorithms learning platform. Please answer concisely in Vietnamese and format code blocks properly using markdown." }
                    }
                }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync(requestUri, jsonContent);
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return $"[Lỗi từ AI Server]: {response.StatusCode} - {error}";
                }

                var responseString = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(responseString);
                
                // Trích xuất text từ response của Gemini
                // format: { "candidates": [ { "content": { "parts": [ { "text": "..." } ] } } ] }
                if (jsonDoc.RootElement.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                {
                    var firstCandidate = candidates[0];
                    if (firstCandidate.TryGetProperty("content", out var content) && 
                        content.TryGetProperty("parts", out var parts) && 
                        parts.GetArrayLength() > 0)
                    {
                        var text = parts[0].GetProperty("text").GetString();
                        return text ?? "Không thể lấy nội dung.";
                    }
                }
                
                return "Không thể phân tích phản hồi từ AI.";
            }
            catch (Exception ex)
            {
                return $"[Lỗi kết nối]: {ex.Message}";
            }
        }
    }
}
