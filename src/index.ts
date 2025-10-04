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
      const { phone_number, name, email } = body;
      const result = await env.DB.prepare(
        "INSERT INTO Users (phone_number, name, email) VALUES (?, ?, ?)"
      ).bind(phone_number, name, email).run();
      return Response.json({ success: result.success, changes: result.changes });
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

    return new Response(
      "endpoint not recognized"
    );
  },
} satisfies ExportedHandler<Env>;
