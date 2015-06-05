using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(BackbonejsExercise.Startup))]
namespace BackbonejsExercise
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
