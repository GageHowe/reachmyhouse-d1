export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);

    // List all users
    if (pathname === "/api/users") {
      const { results } = await env.DB
        .prepare("SELECT * FROM Users")
        .all();
      return Response.json(results);
    }

    // List all groups
    if (pathname === "/api/groups") {
      const { results } = await env.DB
        .prepare("SELECT * FROM Groups")
        .all();
      return Response.json(results);
    }

    // List all members of a given group by group ID
    // Example request: /api/group-members?group_id=1
    if (pathname === "/api/group-members") {
      const groupId = new URL(request.url).searchParams.get("group_id");
      if (!groupId) {
        return new Response("Missing group_id", { status: 400 });
      }
      const { results } = await env.DB
        .prepare(
          "SELECT u.phone_number, u.name, u.email FROM GroupMemberships gm JOIN Users u ON gm.phone_number = u.phone_number WHERE gm.group_id = ?"
        )
        .bind(groupId)
        .all();
      return Response.json(results);
    }

    if (pathname === "/api/groups-by-member") {
      const url = new URL(request.url);
      const phoneNumber = url.searchParams.get("phone_number");
      if (!phoneNumber) {
        return new Response("Missing phone_number", { status: 400 });
      }
      const { results } = await env.DB.prepare(
        `SELECT g.group_id, g.group_name
         FROM GroupMemberships gm
         JOIN Groups g ON gm.group_id = g.group_id
         WHERE gm.phone_number = ?`
      ).bind(phoneNumber).all();
      return Response.json(results);
    }

    // Insert new user (POST: phone_number, name, email)
    if (pathname === "/api/user" && request.method === "POST") {
      const body = await request.json();
      const { phone_number, name, email, latitude = 0.0, longitude = 0.0 } = body;
      const result = await env.DB.prepare(
        "INSERT INTO Users (phone_number, name, email, latitude, longitude) VALUES (?, ?, ?, ?, ?)"
      ).bind(phone_number, name, email, latitude, longitude).run();
      return Response.json({ success: result.success, changes: result.changes });
    }
    if (pathname === "/api/user/location" && request.method === "GET") {
      const url = new URL(request.url);
      const phone_number = url.searchParams.get("phone_number");
      const result = await env.DB.prepare(
        "SELECT latitude, longitude FROM Users WHERE phone_number = ?"
      ).bind(phone_number).all();
      return Response.json(result.results[0] || null);
    }

    // Insert new group (POST: group_name)
    if (pathname === "/api/group" && request.method === "POST") {
      const body = await request.json();
      const { group_name } = body;
      const result = await env.DB.prepare(
        "INSERT INTO Groups (group_name) VALUES (?)"
      ).bind(group_name).run();
      return Response.json({ success: result.success, changes: result.changes });
    }

    // Insert new membership (POST: group_id, phone_number)
    if (pathname === "/api/membership" && request.method === "POST") {
      const body = await request.json();
      const { group_id, phone_number } = body;
      const result = await env.DB.prepare(
        "INSERT INTO GroupMemberships (group_id, phone_number) VALUES (?, ?)"
      ).bind(group_id, phone_number).run();
      return Response.json({ success: result.success, changes: result.changes });
    }

    // Insert new event (POST: group_id, phone_number, type)
    if (pathname === "/api/event" && request.method === "POST") {
      const body = await request.json();
      const { group_id, phone_number, type } = body;
      if (!group_id || !phone_number || typeof type !== "number") {
        return new Response("Missing or invalid fields", { status: 400 });
      }
      const result = await env.DB.prepare(
        "INSERT INTO Events (group_id, phone_number, type) VALUES (?, ?, ?)"
      ).bind(group_id, phone_number, type).run();
      return Response.json({ success: result.success, changes: result.changes });
    }

    // Get all events for a group (GET: group_id query param)
    if (pathname === "/api/events" && request.method === "GET") {
      const url = new URL(request.url);
      const group_id = url.searchParams.get("group_id");
      if (!group_id) {
        return new Response("Missing group_id", { status: 400 });
      }
      const { results } = await env.DB.prepare(
        `SELECT event_id, phone_number, type
        FROM Events
        WHERE group_id = ?`
      ).bind(group_id).all();
      return Response.json(results);
    }

    // Set user location (POST: phone_number, latitude, longitude)
    if (pathname === "/api/user/location" && request.method === "POST") {
      const body = await request.json();
      const { phone_number, latitude, longitude } = body;
      if (!phone_number || typeof latitude !== "number" || typeof longitude !== "number") {
        return new Response("Missing or invalid fields", { status: 400 });
      }
      const result = await env.DB.prepare(
        "UPDATE Users SET latitude = ?, longitude = ? WHERE phone_number = ?"
      ).bind(latitude, longitude, phone_number).run();
      return Response.json({ success: result.success, changes: result.changes });
    }

    // Get user location (GET: phone_number query param)
    if (pathname === "/api/user/location" && request.method === "GET") {
      const url = new URL(request.url);
      const phone_number = url.searchParams.get("phone_number");
      if (!phone_number) {
        return new Response("Missing phone_number", { status: 400 });
      }
      const { results } = await env.DB.prepare(
        "SELECT latitude, longitude FROM Users WHERE phone_number = ?"
      ).bind(phone_number).all();
      return Response.json(results[0] || null);
    }

    return new Response(
      "endpoint not recognized"
    );
  },
} satisfies ExportedHandler<Env>;
