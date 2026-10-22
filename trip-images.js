// Only bundled images can be saved as trip covers; no external URLs or uploads.
export const TRIP_IMAGES = [
  { id: "mediterranean", src: "assets/reise-hero.jpg", name: "Ved Middelhavet", caption: "Litt nærmere feriefølelsen.", captionIcon: "sun", alt: "En grønn koffert og en solhatt på en lys terrasse ved turkis hav.", position: "61% center" },
  { id: "fjord", src: "assets/hero-fjell.jpg", name: "Hytte ved fjorden", caption: "God tid. Fin utsikt.", captionIcon: "mountain", alt: "En liten tømmerhytte med utsikt over en stille fjord og høye fjell.", position: "center" },
  { id: "city", src: "assets/hero-storby.jpg", name: "En helg i storbyen", caption: "Nye gater. Små oppdagelser.", captionIcon: "compass", alt: "Fargerike hus og en seilbåt langs en solfylt kanal.", position: "center" },
  { id: "winter", src: "assets/hero-vinter.jpg", name: "Vinter på hytta", caption: "Kalde dager. Varme pauser.", captionIcon: "heart", alt: "En lun tømmerhytte blant snødekte furutrær ved et frossent vann.", position: "center" },
  { id: "beach", src: "assets/hero-strand.jpg", name: "Dager i solen", caption: "Bare én dukkert til.", captionIcon: "sun", alt: "En stripete parasoll på en rolig sandstrand med klart, turkis vann.", position: "center" },
  { id: "train", src: "assets/hero-togreise.jpg", name: "På skinner gjennom Alpene", caption: "Selve reisen er halve turen.", captionIcon: "ticket", alt: "Utsikt fra et togvindu over en turkis innsjø, med en sekk og kaffekopp i forgrunnen.", position: "center" },
  { id: "forest", src: "assets/hero-skogstur.jpg", name: "En natt under åpen himmel", caption: "Sov ute. Pust ut.", captionIcon: "leaf", alt: "Et lite telt og en ryggsekk ved et stille skogsvann i morgensol.", position: "center" }
];

export const validImageId = id => TRIP_IMAGES.some(image => image.id === id);

export function tripImage(type, imageId = null) {
  const chosen = TRIP_IMAGES.find(image => image.id === imageId);
  return chosen || TRIP_IMAGES.find(image => image.id === ({ city: "city", mountain: "fjord", beach: "beach" }[type] || "mediterranean"));
}
