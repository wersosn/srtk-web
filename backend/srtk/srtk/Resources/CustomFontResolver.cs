using PdfSharp.Drawing;
using PdfSharp.Fonts;

namespace srtk.Resources
{
    public class CustomFontResolver : IFontResolver
    {
        public string DefaultFontName => "Verdana";

        public byte[] GetFont(string faceName)
        {
            if (faceName == "Verdana#Regular")
            {
                return File.ReadAllBytes("D:\\studia\\inzynierka\\web\\backend\\srtk\\srtk\\Resources\\Fonts\\VERDANA.TTF");
            }
            return null;
        }

        public FontResolverInfo ResolveTypeface(string familyName, bool isBold, bool isItalic)
        {
            if (familyName.Equals("Verdana", StringComparison.OrdinalIgnoreCase))
            {
                return new FontResolverInfo("Verdana#Regular");
            }
            return new FontResolverInfo("Verdana#Regular");
        }
    }
}
