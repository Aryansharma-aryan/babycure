# Account and login design

The account hub is available to visitors without forcing a redirect. Its top Login button returns to Account after verification; signed-in visitors see their profile and Logout instead. Recently viewed items are saved on this browser (up to eight IDs), deduplicated and fetched from the live catalog. Customers can clear the history. The English/Hindi preference translates the account menu and is saved locally; product details, address forms and policy pages remain in English. Feedback uses the existing contact-inquiry endpoint and appears with a Website feedback label in the admin enquiry list.

The login layout uses a portrait image alongside the form on desktop and a shorter image panel above the form on mobile. OTP validation, resend timing, return destinations and persistent authentication remain connected to the existing flow.

## Generated artwork

Saved asset: `client/src/assets/babycure-login-family.png`

Generated using the built-in image_gen tool. The image is AI-generated brand artwork, not a customer photograph or testimonial. No product packaging or certification claims were generated.

Final prompt:

> Use case: photorealistic-natural. Asset type: portrait lifestyle artwork for the left-side image panel of the BabyCure India email login page. Create a polished, warm and believable premium baby-care editorial photograph: a loving Indian mother in a modest pale sage cotton blouse gently cuddling a happy fully clothed infant in a cream cotton onesie, their faces naturally close, relaxed candid expressions, realistic skin texture and anatomically correct hands. Soft daylight in a minimal ivory nursery, subtle soft-focus pale blue and sage accents, a simple cream knitted blanket. Vertical portrait composition, subjects mostly in the middle and lower part, generous softly lit clean upper 25 percent for an HTML heading, lower 15 percent calm dark sage shadow for an HTML caption. BabyCure brand palette: soft sky blue, sage green, warm ivory, deep navy. Elegant commercial photography, authentic and understated, no excessive glow or plastic skin. No text, no letters, no logos, no watermark, no product packaging, no extra people, no props near the infant's face. Output one portrait image suitable for a 500 by 700 pixel website panel.
