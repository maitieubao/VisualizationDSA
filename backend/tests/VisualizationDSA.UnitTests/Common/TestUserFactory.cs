using System;
using System.Reflection;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.UnitTests.Common;

public static class TestUserFactory
{
    public static User CreateTeacher(Guid? id = null, string email = "teacher@test.com")
    {
        var user = new User(email, email.Split('@')[0], "hash");
        if (id.HasValue)
        {
            var idProp = typeof(User).GetProperty("Id", BindingFlags.Public | BindingFlags.Instance);
            idProp!.SetValue(user, id.Value);
        }
        user.SetRole("Teacher");
        return user;
    }

    public static User CreateStudent(Guid? id = null, string email = "student@test.com")
    {
        var user = new User(email, email.Split('@')[0], "hash");
        if (id.HasValue)
        {
            var idProp = typeof(User).GetProperty("Id", BindingFlags.Public | BindingFlags.Instance);
            idProp!.SetValue(user, id.Value);
        }
        return user;
    }
}
