using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.Common.Interfaces;

namespace VisualizationDSA.Infrastructure.Services
{
    public class CloudinaryUploadService : IUploadService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryUploadService(IConfiguration config)
        {
            var cloudinaryUrl = config["CloudinarySettings:CloudinaryUrl"];
            if (string.IsNullOrEmpty(cloudinaryUrl))
            {
                var cloudName = config["CloudinarySettings:CloudName"];
                var apiKey = config["CloudinarySettings:ApiKey"];
                var apiSecret = config["CloudinarySettings:ApiSecret"];
                
                if (!string.IsNullOrEmpty(cloudName) && !string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(apiSecret))
                {
                    var account = new Account(cloudName, apiKey, apiSecret);
                    _cloudinary = new Cloudinary(account);
                    return;
                }
                
                throw new Exception("Cloudinary config is missing.");
            }
            
            _cloudinary = new Cloudinary(cloudinaryUrl);
        }

        public async Task<string?> UploadImageAsync(Stream fileStream, string fileName)
        {
            if (fileStream == null || fileStream.Length == 0) return null;

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = "vdsa_images",
                Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
            {
                throw new Exception(uploadResult.Error.Message);
            }

            return uploadResult.SecureUrl?.ToString();
        }

        public async Task<string?> UploadVideoAsync(Stream fileStream, string fileName)
        {
            if (fileStream == null || fileStream.Length == 0) return null;

            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = "vdsa_videos"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
            {
                throw new Exception(uploadResult.Error.Message);
            }

            return uploadResult.SecureUrl?.ToString();
        }

        public async Task<string?> UploadDocumentAsync(Stream fileStream, string fileName)
        {
            if (fileStream == null || fileStream.Length == 0) return null;

            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = "vdsa_documents"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
            {
                throw new Exception(uploadResult.Error.Message);
            }

            return uploadResult.SecureUrl?.ToString();
        }
    }
}
