function stringToColor(str) {
    // Hash the string using DJB2
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
        hash = hash & 0xffffffff; // 32-bit integer
    }

    // Use golden ratio to spread hues
    const goldenRatioConjugate = 0.61803398875;
    let hue = (hash * goldenRatioConjugate) % 1; // 0..1
    hue = Math.floor(hue * 360); // Convert to 0..359

    const saturation = 70 + (Math.abs(hash) % 30); // 70-99%
    const lightness = 50 + (Math.abs(hash) % 10);  // 50-59%

    // Convert HSL to Hex
    function hslToHex(h, s, l) {
        s /= 100; l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r=0, g=0, b=0;
        if (0 <= h && h < 60) { r=c; g=x; b=0; }
        else if (60 <= h && h < 120) { r=x; g=c; b=0; }
        else if (120 <= h && h < 180) { r=0; g=c; b=x; }
        else if (180 <= h && h < 240) { r=0; g=x; b=c; }
        else if (240 <= h && h < 300) { r=x; g=0; b=c; }
        else if (300 <= h && h < 360) { r=c; g=0; b=x; }
        r = Math.round((r+m)*255);
        g = Math.round((g+m)*255);
        b = Math.round((b+m)*255);
        return "#" + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
    }

    return hslToHex(hue, saturation, lightness);
}

export default stringToColor;