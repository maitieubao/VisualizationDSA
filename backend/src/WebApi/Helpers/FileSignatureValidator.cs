using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace VisualizationDSA.WebApi.Helpers
{
    public static class FileSignatureValidator
    {
        private static readonly Dictionary<string, List<byte[]>> _fileSignatures = new()
        {
            { ".jpeg", new List<byte[]>
                {
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE2 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE3 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 }, // EXIF
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE8 }
                }
            },
            { ".jpg", new List<byte[]>
                {
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE2 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE3 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE8 }
                }
            },
            { ".png", new List<byte[]>
                {
                    new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }
                }
            },
            { ".pdf", new List<byte[]>
                {
                    new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D } // %PDF-
                }
            }
        };

        public static bool IsValidFileSignature(Stream stream, string extension)
        {
            if (string.IsNullOrEmpty(extension)) return false;
            
            var ext = extension.ToLowerInvariant();
            
            if (!_fileSignatures.ContainsKey(ext))
            {
                // Nếu extension không nằm trong danh sách cần check chặt chẽ thì cho qua 
                // (VD: mp4, webm vì signature phức tạp hơn)
                return true; 
            }

            var signatures = _fileSignatures[ext];
            var maxSigLength = signatures.Max(m => m.Length);

            var headerBytes = new byte[maxSigLength];
            stream.Read(headerBytes, 0, headerBytes.Length);
            
            // Reset stream position so it can be read later by the upload service
            stream.Position = 0;

            return signatures.Any(signature => 
                headerBytes.Take(signature.Length).SequenceEqual(signature));
        }
    }
}
