/** Lien d'évitement : premier élément focusable de la page (DESIGN.md § 10). */
export function SkipLink() {
  return (
    <a
      href="#contenu"
      className="fixed top-[-100px] left-4 z-(--sil-z-skiplink) rounded-pill bg-neutral-900 px-5 py-3 font-semibold text-white no-underline focus:top-2"
      onClick={(e) => {
        // Focus explicite : certains navigateurs ne déplacent pas le focus séquentiel vers une ancre.
        const main = document.getElementById("contenu");
        if (main) {
          e.preventDefault();
          main.focus();
          main.scrollIntoView();
        }
      }}
    >
      Aller au contenu
    </a>
  );
}
