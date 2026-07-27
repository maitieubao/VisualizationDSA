using System;
using System.Collections.Generic;
using System.Linq;

namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Bộ thực thi DI Container mô phỏng.
/// CRITICAL 4: Sử dụng DFS đệ quy với 3 trạng thái để phát hiện Cyclic Dependency.
/// </summary>
public class DIContainerExecutor
{
    private enum NodeState
    {
        Unvisited,
        Visiting,
        Visited
    }

    /// <summary>
    /// Exception riêng cho lỗi phụ thuộc vòng.
    /// </summary>
    public class CyclicDependencyException : Exception
    {
        public List<string> CyclePath { get; }

        public CyclicDependencyException(List<string> cyclePath)
            : base($"Phát hiện phụ thuộc vòng: {string.Join(" -> ", cyclePath)}")
        {
            CyclePath = cyclePath;
        }
    }

    /// <summary>
    /// Chạy thuật toán phát hiện chu trình trên danh sách đăng ký dịch vụ.
    /// Trả về các frame hoạt ảnh mô tả quá trình duyệt đồ thị.
    /// </summary>
    public List<DIContainerFrameDto> ExecuteCycleDetection(List<DIServiceRegistrationDto> registrations, string targetService)
    {
        var frames = new List<DIContainerFrameDto>();
        var graphNodes = registrations.Select(r => r.InterfaceName).ToList();
        var graphEdges = new List<DIGraphEdgeDto>();
        
        var serviceMap = registrations.ToDictionary(r => r.InterfaceName, r => r);

        foreach (var reg in registrations)
        {
            foreach (var dep in reg.Dependencies)
            {
                graphEdges.Add(new DIGraphEdgeDto { From = reg.InterfaceName, To = dep });
            }
        }

        var baseGraph = new DIGraphDto
        {
            Nodes = graphNodes,
            Edges = graphEdges
        };

        frames.Add(new DIContainerFrameDto
        {
            StepIndex = frames.Count,
            ActionType = "START_RESOLUTION",
            Explanation = $"Bắt đầu resolve service '{targetService}'. Khởi tạo đồ thị phụ thuộc và chuẩn bị DFS.",
            Registrations = CloneRegistrations(registrations),
            Instances = new(),
            DependencyGraph = baseGraph,
            HasCycle = false
        });

        var states = graphNodes.ToDictionary(n => n, _ => NodeState.Unvisited);
        var currentPath = new List<string>();

        try
        {
            DfsDetectCycle(targetService, serviceMap, states, currentPath, frames, registrations, baseGraph);

            frames.Add(new DIContainerFrameDto
            {
                StepIndex = frames.Count,
                ActionType = "RESOLUTION_SUCCESS",
                Explanation = $"Hoàn tất duyệt đồ thị từ '{targetService}'. Không phát hiện phụ thuộc vòng. Có thể tiến hành khởi tạo an toàn.",
                Registrations = CloneRegistrations(registrations),
                Instances = new(),
                DependencyGraph = baseGraph,
                HasCycle = false,
                ResolvedServiceName = targetService
            });
        }
        catch (CyclicDependencyException ex)
        {
            frames.Add(new DIContainerFrameDto
            {
                StepIndex = frames.Count,
                ActionType = "DETECT_CYCLE",
                Explanation = $"LỖI: Phát hiện phụ thuộc vòng! Đường dẫn: {string.Join(" -> ", ex.CyclePath)}. Quá trình Resolve thất bại bằng Exception.",
                Registrations = CloneRegistrations(registrations),
                Instances = new(),
                DependencyGraph = baseGraph,
                HasCycle = true
            });
        }

        return frames;
    }

    private void DfsDetectCycle(
        string currentNode, 
        Dictionary<string, DIServiceRegistrationDto> serviceMap, 
        Dictionary<string, NodeState> states, 
        List<string> currentPath,
        List<DIContainerFrameDto> frames,
        List<DIServiceRegistrationDto> registrations,
        DIGraphDto baseGraph)
    {
        if (!serviceMap.ContainsKey(currentNode))
        {
            // Service không được đăng ký
            return;
        }

        currentPath.Add(currentNode);

        if (states[currentNode] == NodeState.Visiting)
        {
            // Thêm node hiện tại vào cuối currentPath để hiển thị thành vòng tròn (VD: A -> B -> C -> A)
            var cyclePath = new List<string>(currentPath);
            throw new CyclicDependencyException(cyclePath);
        }

        if (states[currentNode] == NodeState.Visited)
        {
            currentPath.RemoveAt(currentPath.Count - 1);
            return; // Đã kiểm tra an toàn trước đó
        }

        states[currentNode] = NodeState.Visiting;

        frames.Add(new DIContainerFrameDto
        {
            StepIndex = frames.Count,
            ActionType = "DFS_VISITING",
            Explanation = $"Đang kiểm tra dependencies của '{currentNode}' (Trạng thái: Visiting).",
            Registrations = CloneRegistrations(registrations),
            Instances = new(),
            DependencyGraph = baseGraph,
            HasCycle = false
        });

        var dependencies = serviceMap[currentNode].Dependencies;
        foreach (var dep in dependencies)
        {
            DfsDetectCycle(dep, serviceMap, states, currentPath, frames, registrations, baseGraph);
        }

        states[currentNode] = NodeState.Visited;
        
        frames.Add(new DIContainerFrameDto
        {
            StepIndex = frames.Count,
            ActionType = "DFS_VISITED",
            Explanation = $"Đã duyệt xong mọi nhánh của '{currentNode}' (Trạng thái: Visited). Node này an toàn.",
            Registrations = CloneRegistrations(registrations),
            Instances = new(),
            DependencyGraph = baseGraph,
            HasCycle = false
        });

        currentPath.RemoveAt(currentPath.Count - 1);
    }

    private List<DIServiceRegistrationDto> CloneRegistrations(List<DIServiceRegistrationDto> original)
    {
        return original.Select(r => new DIServiceRegistrationDto
        {
            InterfaceName = r.InterfaceName,
            ImplementationName = r.ImplementationName,
            Lifetime = r.Lifetime,
            Dependencies = new List<string>(r.Dependencies),
            IsRegistered = r.IsRegistered
        }).ToList();
    }
}
