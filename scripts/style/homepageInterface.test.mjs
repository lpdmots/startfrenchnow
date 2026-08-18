import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("the homepage primary CTA has one interactive element", async () => {
    const source = await readProjectFile("app/components/sfn/home/HeroSfn.tsx");

    assert.doesNotMatch(source, /<ShimmerButton\b/);
    assert.match(source, /<Link[^>]+className="[^"]*btn-primary[^"]*"/);
    assert.match(source, /text-\[56px\] leading-\[1\.12\]/);
    assert.equal(source.match(/active:scale-\[0\.96\]/g)?.length, 2);
});

test("the video overlay exposes an accessible play control", async () => {
    const source = await readProjectFile("app/[locale]/(sfn)/fide/components/VideoFide.tsx");

    assert.match(source, /<button[\s\S]*?aria-label=\{playLabel\}[\s\S]*?onClick=/);
    assert.match(source, /playLabel\?: string/);
});

test("homepage video play labels are localized", async () => {
    const [hero, rita, french, english] = await Promise.all([
        readProjectFile("app/components/sfn/home/HeroSfn.tsx"),
        readProjectFile("app/components/sfn/home/HomeRitaVideoSection.tsx"),
        readProjectFile("app/dictionaries/fr.json"),
        readProjectFile("app/dictionaries/en.json"),
    ]);

    assert.match(hero, /playLabel=\{t\("play_video"\)\}/);
    assert.match(rita, /playLabel=\{t\("play_video"\)\}/);
    assert.equal(JSON.parse(french).HeroSfn.play_video, "Lire la vidéo");
    assert.equal(JSON.parse(english).HeroSfn.play_video, "Play video");
});

test("homepage interactions use specific, restrained transitions", async () => {
    const [rita, reviews] = await Promise.all([
        readProjectFile("app/components/sfn/home/HomeRitaVideoSection.tsx"),
        readProjectFile("app/components/sfn/home/MarqueeSocial.tsx"),
    ]);

    assert.doesNotMatch(rita, /transition-all/);
    assert.doesNotMatch(rita, /whileTap=\{\{ scale: 0\.99 \}\}/);
    assert.doesNotMatch(reviews, /whileTap=\{\{ scale: 0\.99 \}\}/);
    assert.match(rita, /whileTap=\{\{ scale: 0\.96 \}\}/);
    assert.match(reviews, /whileTap=\{\{ scale: 0\.96 \}\}/);
});

test("homepage typography and focus polish are scoped and root text is antialiased", async () => {
    const [layout, page, styles] = await Promise.all([
        readProjectFile("app/[locale]/layout.tsx"),
        readProjectFile("app/[locale]/(sfn)/page.tsx"),
        readProjectFile("app/styles/globals.css"),
    ]);

    assert.match(layout, /className=\{`\$\{poppins\.variable\} font-sans antialiased`\}/);
    assert.match(page, /className="home-page /);
    assert.match(styles, /\.home-page :is\(h1, h2, h3\)[\s\S]*text-wrap: balance/);
    assert.match(styles, /\.home-page :is\(p, li\)[\s\S]*text-wrap: pretty/);
    assert.match(styles, /\.home-page :is\(a, button, summary, \[role="button"\]\):focus-visible/);
});

test("preparation cards use tactile, elevated surfaces with outlined images", async () => {
    const source = await readProjectFile("app/components/sfn/home/HomePreparationOptionsSection.tsx");

    assert.match(source, /\{t\("subtitle"\)\}/);
    assert.match(source, /home-elevated-card/);
    assert.match(source, /active:scale-\[0\.96\]/);
    assert.match(source, /transition-\[transform,box-shadow\]/);
    assert.match(source, /outline-black\/10/);
    assert.doesNotMatch(source, /shadow-sm transition duration/);
});

test("the mobile navigation trigger is semantic and hides closed links", async () => {
    const source = await readProjectFile("app/components/common/Burger.tsx");

    assert.match(source, /<button[\s\S]*?aria-expanded=\{open\}[\s\S]*?aria-controls="mobile-navigation"/);
    assert.match(source, /id="mobile-navigation"/);
    assert.match(source, /\{open && navigationItems\.map/);
    assert.doesNotMatch(source, /transition:\s*"all/);
    assert.doesNotMatch(source, /<div[^>]*onClick=\{onClick\}/);
});

test("continuous and entrance motion respect reduced-motion preferences", async () => {
    const [marquee, slides, fades, scale] = await Promise.all([
        readProjectFile("app/components/ui/marquee.tsx"),
        readProjectFile("app/components/animations/Slides.tsx"),
        readProjectFile("app/components/animations/Fades.tsx"),
        readProjectFile("app/components/animations/Scale.tsx"),
    ]);

    assert.match(marquee, /motion-reduce:\[animation-play-state:paused\]/);
    for (const source of [slides, fades, scale]) {
        assert.match(source, /useReducedMotion/);
    }
});

test("the review score animates explicit properties and keeps digits stable", async () => {
    const source = await readProjectFile("app/components/common/CircularProgressMagic.tsx");

    assert.doesNotMatch(source, /transition:\s*"all/);
    assert.match(source, /transitionProperty:\s*"stroke-dasharray, transform"/);
    assert.match(source, /tabular-nums/);
});

test("the homepage FAQ uses accordion state instead of imperative style mutation", async () => {
    const [source, primitive] = await Promise.all([
        readProjectFile("app/[locale]/(sfn)/fide/components/FideFaq.tsx"),
        readProjectFile("app/components/ui/accordion.tsx"),
    ]);

    assert.doesNotMatch(source, /AccordionButton/);
    assert.match(source, /group-data-\[state=open\]:rotate-45/);
    assert.match(source, /motion-reduce:transition-none/);
    assert.doesNotMatch(primitive, /transition-all/);
});

test("social proof cards are secure, tactile, and use stable figures", async () => {
    const source = await readProjectFile("app/components/sfn/home/HomeSocialProofBand.tsx");

    assert.match(source, /rel="noopener noreferrer"/);
    assert.match(source, /active:scale-\[0\.96\]/);
    assert.match(source, /tabular-nums/);
    assert.doesNotMatch(source, /transition duration-/);
});

test("homepage photography uses a subtle image outline", async () => {
    const source = await readProjectFile("app/components/sfn/home/WhyFideHome.tsx");

    assert.match(source, /outline-black\/10/);
    assert.doesNotMatch(source, /border:\s*"solid 4px/);
});

test("header icon controls have localized names and 44px targets", async () => {
    const [navbar, darkMode, profile, dropdown] = await Promise.all([
        readProjectFile("app/components/common/NavBar.tsx"),
        readProjectFile("app/components/common/DarkMode.tsx"),
        readProjectFile("app/components/auth/ProfilButton.tsx"),
        readProjectFile("app/components/common/DropdownMenu.tsx"),
    ]);

    assert.match(navbar, /aria-label=\{t\("contact_us"\)\}/);
    assert.match(darkMode, /size-11/);
    assert.match(darkMode, /t\("switchToLight"\)/);
    assert.match(darkMode, /t\("switchToDark"\)/);
    assert.match(profile, /aria-label=\{t\("my_account"\)\}/);
    assert.match(dropdown, /onKeyDown=/);
    assert.match(dropdown, /aria-expanded=\{openOnClick \? isOpen : undefined\}/);
});

test("homepage text links use the shared icon set and restrained motion", async () => {
    const source = await readProjectFile("app/components/common/LinkArrow.tsx");

    assert.match(source, /import \{ ArrowRight \} from "lucide-react"/);
    assert.doesNotMatch(source, /framer-motion|react-icons/);
    assert.match(source, /duration-150/);
    assert.match(source, /noopener noreferrer/);
});
