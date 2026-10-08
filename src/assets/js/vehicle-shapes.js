// Vehicle shapes for the tint walkthrough: year/make/model -> body style, and a top-down drawing of that style with tappable glass.
// window.labVehicle = { makes(), models(make), find(make, model), STYLES, draw(svg, style, size) }
(function () {
    // Body styles. Same window ids as the price tables use: ws, brow, sun, fl/fr (front pair), rl/rr, ql/qr (quarter), rear.
    // pkg = which "full package" price applies when every window in base is chosen (null = always itemised).
    // popular = what most people tint on that style; flip it here, nowhere else.
    const STYLES = {
        sedan: { name: 'Sedan', E: 556, ws: 128, roofEnd: 446, sides: [['f', 200, 290], ['r', 298, 386], ['q', 394, 440]], rear: [456, 502, 1], cabEnd: 510, sun: [214, 280], bed: null, pkg: 'sedan', rearKey: 'rear', base: ['fl', 'fr', 'rl', 'rr', 'ql', 'qr', 'rear'], popular: ['fl', 'fr', 'rl', 'rr', 'ql', 'qr', 'rear', 'brow'] },
        coupe: { name: 'Coupe', E: 540, ws: 134, roofEnd: 410, sides: [['f', 204, 310], ['q', 318, 392]], rear: [420, 462, 1], cabEnd: 470, sun: [214, 280], bed: null, pkg: null, rearKey: 'rear', base: ['fl', 'fr', 'ql', 'qr', 'rear'], popular: ['fl', 'fr', 'ql', 'qr', 'rear', 'brow'] },
        suv: { name: 'SUV or van', E: 556, ws: 138, roofEnd: 452, sides: [['f', 208, 296], ['r', 304, 390], ['q', 398, 446]], rear: [458, 508, 1], cabEnd: 516, sun: [218, 284], bed: null, pkg: 'suv', rearKey: 'rearLarge', base: ['fl', 'fr', 'rl', 'rr', 'ql', 'qr', 'rear'], popular: ['fl', 'fr', 'brow'] },
        crew: { name: 'Crew cab truck', E: 568, ws: 136, roofEnd: 366, sides: [['f', 204, 280], ['r', 288, 356]], rear: [374, 394, 0], cabEnd: 402, sun: [212, 270], bed: [410, 560], pkg: 'truck', rearKey: 'rear', base: ['fl', 'fr', 'rl', 'rr', 'rear'], popular: ['fl', 'fr', 'brow'] },
        reg: { name: 'Regular or extended cab truck', E: 560, ws: 136, roofEnd: 296, sides: [['f', 204, 284]], rear: [304, 324, 0], cabEnd: 332, sun: null, bed: [340, 552], pkg: null, rearKey: 'rear', base: ['fl', 'fr', 'rear'], popular: ['fl', 'fr', 'brow'] },
    };

    // One line per make: 'Model name|alias,alias:style:size'. Style: s sedan, c coupe, u SUV/van, t crew cab pickup, r regular cab pickup.
    // Size 0 compact .. 3 heavy duty (stretches the drawing a little). Specific entries come before general ones.
    const CODE = { s: 'sedan', c: 'coupe', u: 'suv', t: 'crew', r: 'reg' };
    const MAKES = {
        Ford: ['F-250 Super Duty|f250,superduty:t:3', 'F-350 Super Duty|f350:t:3', 'F-450 Super Duty|f450:t:3', 'F-150|f150:t:2', 'Ranger:t:1', 'Maverick:t:1', 'Bronco Sport|broncosport:u:0', 'Bronco:u:1', 'Escape:u:1', 'Edge:u:1', 'Explorer:u:2', 'Expedition:u:3', 'Transit:u:3', 'Fusion:s:1', 'Focus:s:0', 'Fiesta:s:0', 'Mustang:c:1'],
        Chevrolet: ['Silverado 2500HD|2500,3500:t:3', 'Silverado 1500|1500,silverado:t:2', 'Colorado:t:1', 'Tahoe:u:3', 'Suburban:u:3', 'Traverse:u:2', 'Equinox:u:1', 'Blazer:u:1', 'Trax:u:0', 'Express:u:3', 'Malibu:s:1', 'Cruze:s:0', 'Camaro:c:1', 'Corvette:c:1'],
        GMC: ['Sierra 2500HD|2500,3500:t:3', 'Sierra 1500|1500,sierra:t:2', 'Canyon:t:1', 'Yukon XL|yukonxl:u:3', 'Yukon:u:3', 'Acadia:u:2', 'Terrain:u:1'],
        Ram: ['2500:t:3', '3500:t:3', '1500:t:2', 'ProMaster|promaster:u:3'],
        Dodge: ['Ram 2500|2500:t:3', 'Ram 3500|3500:t:3', 'Ram 1500|1500,ram:t:2', 'Durango:u:2', 'Grand Caravan|caravan:u:2', 'Journey:u:1', 'Charger:s:2', 'Challenger:c:2'],
        Jeep: ['Wrangler:u:1', 'Gladiator:t:1', 'Grand Cherokee|grandcherokee:u:2', 'Cherokee:u:1', 'Compass:u:0', 'Renegade:u:0'],
        Toyota: ['Tacoma:t:1', 'Tundra:t:2', '4Runner:u:2', 'RAV4:u:1', 'Highlander:u:2', 'Sequoia:u:3', 'Land Cruiser|landcruiser:u:2', 'Sienna:u:2', 'Corolla:s:0', 'Camry:s:1'],
        Honda: ['Ridgeline:t:1', 'CR-V|crv:u:1', 'HR-V|hrv:u:0', 'Pilot:u:2', 'Odyssey:u:2', 'Civic:s:0', 'Accord:s:1'],
        Nissan: ['Titan:t:2', 'Frontier:t:1', 'Rogue:u:1', 'Pathfinder:u:2', 'Murano:u:1', 'Armada:u:3', 'Kicks:u:0', 'Altima:s:1', 'Sentra:s:0', '370Z:c:1'],
        Hyundai: ['Santa Cruz|santacruz:t:1', 'Santa Fe|santafe:u:1', 'Tucson:u:1', 'Palisade:u:2', 'Kona:u:0', 'Elantra:s:0', 'Sonata:s:1'],
        Kia: ['Telluride:u:2', 'Sorento:u:1', 'Sportage:u:1', 'Seltos:u:0', 'Soul:u:0', 'Carnival:u:2', 'Forte:s:0', 'K5:s:1'],
        Subaru: ['Outback:u:1', 'Forester:u:1', 'Crosstrek:u:0', 'Ascent:u:2', 'Impreza:s:0', 'WRX:s:0', 'Legacy:s:1', 'BRZ:c:0'],
        Mazda: ['CX-5|cx5:u:1', 'CX-9|cx9:u:2', 'CX-30|cx30:u:0', 'CX-50|cx50:u:1', 'Mazda3|3:s:0', 'Mazda6|6:s:1', 'MX-5|mx5,miata:c:0'],
        Volkswagen: ['Tiguan:u:1', 'Atlas:u:2', 'Taos:u:0', 'Jetta:s:0', 'Golf:s:0', 'Passat:s:1'],
        Tesla: ['Cybertruck:t:2', 'Model Y|modely:u:1', 'Model X|modelx:u:2', 'Model 3|model3:s:1', 'Model S|models:s:2'],
        BMW: ['X3:u:1', 'X5:u:2', 'X7:u:3', '3 Series|3series,330,m3:s:1', '5 Series|5series,530:s:2', 'M4:c:1'],
        Audi: ['Q5:u:1', 'Q7:u:2', 'A3:s:0', 'A4:s:1', 'A6:s:2'],
        'Mercedes-Benz': ['GLC:u:1', 'GLE:u:2', 'GLS:u:3', 'G-Class|gclass,gwagon:u:2', 'C-Class|cclass:s:1', 'E-Class|eclass:s:2'],
        Lexus: ['RX:u:1', 'GX:u:2', 'LX:u:3', 'NX:u:1', 'ES:s:1', 'IS:s:1'],
        Acura: ['MDX:u:2', 'RDX:u:1', 'TLX:s:1'],
    };
    const ALIAS = { chevy: 'Chevrolet', vw: 'Volkswagen', merc: 'Mercedes-Benz', mercedes: 'Mercedes-Benz', mercedesbenz: 'Mercedes-Benz', ramtrucks: 'Ram', dodgeram: 'Dodge' };
    const SXS_MAKES = ['polaris', 'canam', 'arcticcat', 'kawasaki', 'yamaha', 'cfmoto', 'segway', 'textron'];
    const SXS_MODEL = /rzr|ranger|maverick|talon|pioneer|wolverine|viking|general|teryx|mule|defender|commander|ranch|x3/;

    const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const parsed = {};
    Object.keys(MAKES).forEach((make) => {
        parsed[make] = MAKES[make].map((line) => {
            const [head, style, size] = line.split(':');
            const [name, aliases] = head.split('|');
            return { name, keys: [norm(name)].concat((aliases || '').split(',').map(norm)).filter(Boolean), style: CODE[style], size: +size };
        });
    });

    function makeOf(text) {
        const n = norm(text);
        if (!n) return null;
        if (ALIAS[n]) return ALIAS[n];
        return Object.keys(MAKES).find((m) => norm(m) === n) || Object.keys(MAKES).find((m) => norm(m).indexOf(n) === 0 && n.length >= 3) || null;
    }

    // -> { name, style, size } | { sxs: true } | null
    function find(makeText, modelText) {
        const mk = norm(makeText), nm = norm(modelText);
        if (SXS_MAKES.indexOf(mk) > -1 && SXS_MODEL.test(nm)) return { sxs: true };
        const make = makeOf(makeText);
        if (!make || !nm) return null;
        // typed text that contains a model beats typed text that is only the start of one ("silverado" is the 1500, not the 2500HD)
        const list = parsed[make];
        const hit = list.find((e) => e.keys.some((k) => nm.indexOf(k) > -1)) || (nm.length >= 3 && list.find((e) => e.keys.some((k) => k.indexOf(nm) === 0)));
        return hit ? { name: make + ' ' + hit.name, style: hit.style, size: hit.size } : null;
    }

    // ---- drawing ----
    const mirror = (pts) => pts.map((p) => [300 - p[0], p[1]]);
    const pts = (a) => a.map((p) => p.join(',')).join(' ');
    const win = (id, label, points, text) => '<polygon class="win' + (id === 'brow' ? ' win--brow' : '') + '" data-id="' + id + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + label + '" points="' + points + '"><title>' + label + '</title></polygon>' + (text ? '<text class="wl" x="' + text[1] + '" y="' + text[2] + '" text-anchor="middle" dominant-baseline="middle"' + (text[3] ? ' transform="rotate(' + text[3] + ' ' + text[1] + ' ' + text[2] + ')"' : '') + '>' + text[0] + '</text>' : '');

    function draw(svg, key, size) {
        const s = STYLES[key] || STYLES.crew, E = s.E, ws = s.ws, c1 = ws + 68, c2 = s.cabEnd - 70;
        const k = [0.93, 1, 1.04, 1.07][size == null ? 1 : size], kx = [0.95, 1, 1.02, 1.04][size == null ? 1 : size];
        const cy = (24 + E) / 2;
        let h = '';
        [[20, 118], [266, 118], [20, E - 146], [266, E - 146]].forEach((w) => { h += '<rect class="wheel" x="' + w[0] + '" y="' + w[1] + '" width="14" height="58" rx="5"/>'; });
        h += '<path class="car-body" d="M72 24 H228 Q256 24 262 54 L268 128 L264 330 L268 ' + (E - 36) + ' Q262 ' + E + ' 228 ' + E + ' H72 Q38 ' + E + ' 32 ' + (E - 36) + ' L36 330 L32 128 L38 54 Q44 24 72 24 Z"/>';
        h += '<rect class="light" x="58" y="36" width="40" height="10" rx="5"/><rect class="light" x="202" y="36" width="40" height="10" rx="5"/>';
        h += '<path class="car-line" d="M96 ' + (ws - 28) + ' H204 M120 60 H180"/>';
        if (s.bed) h += '<rect class="car-bed" x="48" y="' + s.bed[0] + '" width="204" height="' + (s.bed[1] - s.bed[0]) + '" rx="6"/><path class="car-line" d="M48 ' + (s.bed[0] + 14) + ' H252"/>';
        h += '<rect class="mirror" x="32" y="' + (ws + 58) + '" width="26" height="16" rx="7"/><rect class="mirror" x="242" y="' + (ws + 58) + '" width="26" height="16" rx="7"/>';
        h += '<path class="car-cabin" d="M82 ' + ws + ' H218 L246 ' + c1 + ' V' + c2 + ' L226 ' + s.cabEnd + ' H74 L54 ' + c2 + ' V' + c1 + ' Z"/>';
        h += '<rect class="car-roof" x="100" y="' + (c1 + 4) + '" width="100" height="' + (s.roofEnd - c1 - 4) + '" rx="12"/>';
        h += '<text class="car-end" x="150" y="' + (ws - 44) + '" text-anchor="middle">FRONT</text><text class="car-end" x="150" y="' + (E - 16) + '" text-anchor="middle">REAR</text>';
        h += win('ws', 'Full windshield', pts([[88, ws], [212, ws], [236, ws + 64], [64, ws + 64]]), ['WINDSHIELD', 150, ws + 50]);
        h += win('brow', 'Windshield brow, the strip across the top of the windshield', pts([[94, ws + 2], [206, ws + 2], [214, ws + 28], [86, ws + 28]]), ['BROW', 150, ws + 14]);
        if (s.sun) h += win('sun', 'Sunroof or panoramic roof', pts([[114, s.sun[0]], [186, s.sun[0]], [186, s.sun[1]], [114, s.sun[1]]]), ['ROOF', 150, (s.sun[0] + s.sun[1]) / 2]);
        s.sides.forEach((b) => {
            const y0 = b[1], y1 = b[2], m = (y0 + y1) / 2;
            const L = b[0] === 'f' ? [[64, y0], [102, y0], [102, y1], [60, y1]] : b[0] === 'r' ? [[60, y0], [102, y0], [102, y1], [57, y1]] : [[58, y0], [102, y0], [102, y1], [64, y1]];
            const R = mirror(L);
            if (b[0] === 'f') h += win('fl', 'Front windows (priced as a pair)', pts(L), ['FRONT', 82, m, -90]) + win('fr', 'Front windows (priced as a pair)', pts(R), ['FRONT', 218, m, 90]);
            else if (b[0] === 'r') h += win('rl', 'Rear left side window', pts(L), ['REAR', 80, m, -90]) + win('rr', 'Rear right side window', pts(R), ['REAR', 220, m, 90]);
            else h += win('ql', 'Left quarter glass', pts(L), ['¼', 80, m]) + win('qr', 'Right quarter glass', pts(R), ['¼', 220, m]);
        });
        const r = s.rear;
        h += win('rear', 'Rear glass', r[2] ? pts([[92, r[0]], [208, r[0]], [226, r[1]], [74, r[1]]]) : pts([[110, r[0]], [190, r[0]], [196, r[1]], [104, r[1]]]), [r[2] ? 'REAR GLASS' : 'REAR', 150, (r[0] + r[1]) / 2]);
        svg.innerHTML = '<g transform="translate(150 ' + cy + ') scale(' + kx + ' ' + k + ') translate(-150 -' + cy + ')">' + h + '</g>';
    }

    window.labVehicle = {
        STYLES,
        makes: () => Object.keys(MAKES),
        models: (make) => { const m = makeOf(make); return m ? parsed[m].map((e) => e.name) : []; },
        find,
        draw,
    };
})();
