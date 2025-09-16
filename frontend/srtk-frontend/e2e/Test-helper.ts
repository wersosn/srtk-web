type FakeTokenOptions = {
    userId: number | string;
    email: string;
    role: string;
    facilityId: number | string;
};

function generateFakeJwtToken({ userId, email, role, facilityId }: FakeTokenOptions): string {
    const exp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

    const payload = {
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": `${userId}`,
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": email,
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": role,
        jti: `fake-${userId}-${Math.random().toString(36).substr(2, 6)}`,
        FacilityId: `${facilityId}`,
        exp,
        iss: "srtk-backend",
        aud: "srtk-clients",
    };

    function base64UrlEncode(obj: object) {
        return Buffer.from(JSON.stringify(obj))
            .toString("base64")
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
    }

    const header = { alg: "HS256", typ: "JWT" };
    const token = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.signature-placeholder`;
    return token;
}

// Fałszywy token dla SuperAdmina (FacilityId = 0)
export const fakeJwtToken = generateFakeJwtToken({
    userId: 11,
    email: "admin@admin.pl",
    role: "Admin",
    facilityId: 0
});

// Fałszywy token dla zwykłego Admina (FacilityId = 1)
export const fakeAdminJwtToken = generateFakeJwtToken({
    userId: 3,
    email: "admin2@admin.pl",
    role: "Admin",
    facilityId: 1
});
