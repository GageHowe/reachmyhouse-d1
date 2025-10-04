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

    return new Response(
      "Available endpoints: /api/users /api/groups /api/group-members?group_id=<id>"
    );
  },
} satisfies ExportedHandler<Env>;
