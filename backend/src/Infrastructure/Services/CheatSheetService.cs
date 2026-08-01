using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs.Language;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class CheatSheetService : ICheatSheetService
    {
        private readonly ApplicationDbContext _context;

        public CheatSheetService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CheatSheetSnippetDto?> GetSnippetAsync(string language, string dataStructure)
        {
            var snippet = await _context.CheatSheetSnippets
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Language.ToLower() == language.ToLower() && 
                                          x.DataStructure.ToLower() == dataStructure.ToLower());

            if (snippet == null) return null;

            return new CheatSheetSnippetDto
            {
                Language = snippet.Language,
                DataStructure = snippet.DataStructure,
                CodeSnippet = snippet.CodeSnippet,
                Explanation = snippet.Explanation
            };
        }
    }
}
