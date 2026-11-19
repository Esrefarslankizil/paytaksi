namespace PayTaksi.Api.Models;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Taksici = "Taksici";
    public const string Yolcu = "Yolcu";

    public static readonly string[] All = { Admin, Taksici, Yolcu };
}
