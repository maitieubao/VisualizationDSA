using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.RegenerateInviteCode
{
    public class RegenerateInviteCodeCommandHandler : IRequestHandler<RegenerateInviteCodeCommand, string>
    {
        private readonly IApplicationDbContext _context;

        public RegenerateInviteCodeCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> Handle(RegenerateInviteCodeCommand request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
                throw new ArgumentException("Classroom not found.");

            if (classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Not your classroom.");

            string newCode;
            do
            {
                newCode = GenerateInviteCode();
            } while (await _context.Classrooms.AnyAsync(c => c.InviteCode == newCode, cancellationToken));

            classroom.UpdateInviteCode(newCode);
            await _context.SaveChangesAsync(cancellationToken);

            return newCode;
        }

        private string GenerateInviteCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
