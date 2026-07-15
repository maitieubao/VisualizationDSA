using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Input
{
    public static class ConstraintResolver
    {
        private static readonly Dictionary<string, int> SafetyLimits =
            new(StringComparer.OrdinalIgnoreCase)
            {
                { "linear-search", 100 },
                { "binary-search", 150 },
                { "bubble-sort", 50 },
                { "selection-sort", 50 },
                { "insertion-sort", 50 },
                { "quick-sort", 150 },
                { "merge-sort", 150 },
                { "stack", 20 },
                { "queue", 20 },
                { "bst", 15 },
                { "tsp-backtracking", 10 }
            };

        public static int GetAllowedLimit(string algorithmId)
        {
            if (SafetyLimits.TryGetValue(algorithmId, out int maxLimit))
            {
                return maxLimit;
            }
            return 10;
        }

        public static bool ValidateSize(string algorithmId, int currentSize, out int allowedLimit)
        {
            allowedLimit = GetAllowedLimit(algorithmId);
            return currentSize <= allowedLimit;
        }
    }
}
