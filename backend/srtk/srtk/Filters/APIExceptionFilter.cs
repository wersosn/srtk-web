using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;

namespace srtk.Filters
{
    public class APIExceptionFilter : ExceptionFilterAttribute
    {
        public override void OnException(ExceptionContext context)
        {
            context.Result = new ObjectResult(new { error = context.Exception.Message }) { StatusCode = 500 };
            context.ExceptionHandled = true;
        }
    }
}
