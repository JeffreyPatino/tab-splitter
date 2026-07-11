export interface Env {
  AI: any;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: 'No image file provided' }), { status: 400, headers: corsHeaders });
      }

      const buffer = await file.arrayBuffer();
      const imageArray = [...new Uint8Array(buffer)];

      const prompt = `You are a highly precise receipt parser. Extract line items, prices, tax, tip, and the place name. 
Return ONLY a valid JSON object. Do NOT include ANY conversational text before or after the JSON.
Do NOT use markdown code blocks. 
Example output: {"placeName": "Joe's Diner", "items": [{"name": "Burger", "price": 12.99}, {"name": "Fries", "price": 4.50}], "tax": 1.50, "tip": 2.00}`;

      const aiResponse = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
        prompt: prompt,
        image: imageArray
      });

      let rawOutput = aiResponse.response || aiResponse;
      let parsedPayload: any = {};
      
      try {
        if (typeof rawOutput === 'object') {
          parsedPayload = rawOutput;
        } else if (typeof rawOutput === 'string') {
          let text = rawOutput;
          const jsonStart = text.indexOf('{');
          const jsonEnd = text.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1) {
            text = text.substring(jsonStart, jsonEnd + 1);
            parsedPayload = JSON.parse(text);
          } else {
            throw new Error("No JSON object found in AI response (It might have failed to read the receipt).");
          }
        }
      } catch (err: any) {
        throw new Error("The AI failed to generate valid data for this receipt. Please try scanning it again. " + (err.message || ''));
      }

      const items = Array.isArray(parsedPayload.items) ? parsedPayload.items : (Array.isArray(parsedPayload) ? parsedPayload : []);
      const tax = parsedPayload.tax || null;
      const tip = parsedPayload.tip || null;
      const placeName = parsedPayload.placeName || null;

      return new Response(JSON.stringify({ items, tax, tip, placeName }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });

    } catch (error: any) {
      console.error("AI Error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  },
};
