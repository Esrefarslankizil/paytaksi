using Microsoft.AspNetCore.Identity;

namespace PayTaksi.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}
