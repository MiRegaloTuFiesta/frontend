export function formatRut(rut: string): string {
    const cleanRut = rut.replace(/[^kK0-9]/g, '');
    if (!cleanRut) return '';

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    let formattedBody = '';
    for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
        formattedBody = body.charAt(i) + formattedBody;
        if (j % 3 === 2 && i !== 0) {
            formattedBody = '.' + formattedBody;
        }
    }

    return `${formattedBody}-${dv}`;
}

export function validateRut(rut: string): boolean {
    const cleanRut = rut.replace(/[^kK0-9]/g, '');
    if (cleanRut.length < 8) return false;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    let total = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        total += parseInt(body.charAt(i), 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (total % 11);
    let finalDv = expectedDv.toString();
    if (expectedDv === 11) finalDv = '0';
    if (expectedDv === 10) finalDv = 'K';

    return finalDv === dv;
}
