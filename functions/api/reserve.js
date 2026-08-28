export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();

    const gasEndpoint = context.env.GAS_ENDPOINT;
    const apiSecret = context.env.NF7_API_SECRET;

    if (!gasEndpoint || !apiSecret) {
      return jsonResponse(
        {
          ok: false,
          error: "Cloudflare server configuration is incomplete."
        },
        500
      );
    }

    const gasResponse = await fetch(gasEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: JSON.stringify({
        secret: apiSecret,
        payload: payload
      }),
      redirect: "follow"
    });

    const responseText = await gasResponse.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch (error) {
      return jsonResponse(
        {
          ok: false,
          error: "Invalid response from reservation server."
        },
        502
      );
    }

    return jsonResponse(
      result,
      result.ok === false ? 400 : 200
    );

  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error:
          error && error.message
            ? error.message
            : "Reservation request failed."
      },
      500
    );
  }
}


export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Allow": "POST, OPTIONS"
    }
  });
}


function jsonResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status: status,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "no-store"
      }
    }
  );
}
