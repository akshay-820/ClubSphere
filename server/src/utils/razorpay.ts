import crypto from "crypto";

type RazorpayOrder = {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
};

function getRazorpayCredentials() {
    const keyId = process.env.RAZORPAY_API_KEY;
    const keySecret = process.env.RAZORPAY_API_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("Razorpay credentials are not configured");
    }

    return { keyId, keySecret };
}

export function getRazorpayKeyId() {
    return getRazorpayCredentials().keyId;
}

export async function createRazorpayOrder(input: {
    amountInPaise: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
}) {
    const { keyId, keySecret } = getRazorpayCredentials();
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            amount: input.amountInPaise,
            currency: input.currency ?? "INR",
            receipt: input.receipt,
            notes: input.notes,
        }),
    });

    const payload = (await response.json()) as RazorpayOrder & {
        error?: { description?: string };
    };

    if (!response.ok) {
        throw new Error(
            payload.error?.description || "Failed to create Razorpay order",
        );
    }

    return payload;
}

export function verifyRazorpayPaymentSignature(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}) {
    const { keySecret } = getRazorpayCredentials();
    const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
        .digest("hex");

    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(input.razorpaySignature);
    return expected.length === received.length
        ? crypto.timingSafeEqual(expected, received)
        : false;
}

export function verifyRazorpayWebhookSignature(
    rawBody: Buffer,
    signature: string,
) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error("Razorpay webhook secret is not configured");
    }

    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(signature);
    return expected.length === received.length
        ? crypto.timingSafeEqual(expected, received)
        : false;
}
