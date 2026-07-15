using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Domain.Lectures;

public class Lecture
{
    [Required]
    public string LectureId { get; set; } = string.Empty;

    [Required]
    public string AlgorithmId { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string Title { get; set; } = string.Empty;

    public List<Slide> Slides { get; set; } = new();
}

public class Slide
{
    [Required]
    public int SlideId { get; set; }

    [Required]
    public string Type { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [Required]
    public SlideAction Action { get; set; } = new();
}

public class SlideAction
{
    [Required]
    public string Command { get; set; } = string.Empty;

    [Required]
    public int TargetFrame { get; set; }
}
