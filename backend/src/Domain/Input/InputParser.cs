using System;
using System.Linq;
using System.Text.RegularExpressions;

namespace VisualizationDSA.Domain.Input
{
    public static class InputParser
    {
        private static readonly Regex ArrayPattern = new(@"^([+-]?\d+)(\s*,\s*[+-]?\d+)*$");

        public static int[] ParseArray(string rawInput)
        {
            if (string.IsNullOrWhiteSpace(rawInput))
            {
                throw new ArgumentException("Dữ liệu đầu vào không được để trống.");
            }

            string cleanInput = rawInput.Trim();

            if (!ArrayPattern.IsMatch(cleanInput))
            {
                throw new FormatException(
                    "Định dạng dữ liệu không hợp lệ. Chỉ cho phép các số nguyên cách nhau bằng dấu phẩy.");
            }

            try
            {
                return cleanInput
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => int.Parse(s.Trim()))
                    .ToArray();
            }
            catch (OverflowException)
            {
                throw new OverflowException(
                    "Phát hiện phần tử vượt quá giá trị giới hạn tối đa của kiểu số nguyên 32-bit.");
            }
            catch (Exception ex)
            {
                throw new FormatException(
                    $"Đã xảy ra lỗi trong quá trình phân tích số nguyên: {ex.Message}");
            }
        }
    }
}
