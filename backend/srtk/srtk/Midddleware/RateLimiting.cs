namespace srtk.Midddleware
{
    public class RateLimiting
    {
        private static Dictionary<string, int> requests = new();

        private readonly RequestDelegate _next;

        public RateLimiting(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            var ip = context.Connection.RemoteIpAddress?.ToString();
            if (ip != null)
            {
                if (!requests.ContainsKey(ip))
                {
                    requests[ip] = 0;
                }
                requests[ip]++;

                if (requests[ip] > 2500)
                {
                    context.Response.StatusCode = 429;
                    await context.Response.WriteAsync("Rate limit przekroczony!");
                    return;
                }
            }
            await _next(context);
        }
    }
}
