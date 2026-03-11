import { db } from "./db";
import fs from "fs";

function render(view: string) {
  const layout = fs.readFileSync("./views/layout/main.html", "utf8");
  return layout.replace("{{content}}", view);
}

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // DASHBOARD
    if (url.pathname == "/") {
      const [rows]: any = await db.query("SELECT COUNT(*) as total FROM mahasiswa");
      let view = fs.readFileSync("./views/dashboard/index.html", "utf8");
      view = view.replace("{{total}}", rows[0].total);
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // LIST MAHASISWA
    if (url.pathname == "/mahasiswa") {
      const [rows]: any = await db.query("SELECT * FROM mahasiswa");
      let table = "";
      rows.forEach((m: any) => {
        table += `
<tr>
  <td class="p-2">${m.id}</td>
  <td class="p-2">${m.nama}</td>
  <td class="p-2">${m.jurusan}</td>
  <td class="p-2">${m.angkatan}</td>
  <td class="p-2">
    <a href="/mahasiswa/edit/${m.id}" class="text-blue-500">Edit</a>
    <a href="/mahasiswa/delete/${m.id}" class="text-red-500 ml-2">Delete</a>
  </td>
</tr>`;
      });
      let view = fs.readFileSync("./views/mahasiswa/index.html", "utf8");
      view = view.replace("{{rows}}", table);
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // FORM TAMBAH
    if (url.pathname == "/mahasiswa/create") {
      let view = fs.readFileSync("./views/mahasiswa/create.html", "utf8");
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // SIMPAN DATA BARU
    if (url.pathname == "/mahasiswa/store" && req.method == "POST") {
      const body = await req.formData();
      await db.query("INSERT INTO mahasiswa (nama, jurusan, angkatan) VALUES (?, ?, ?)", [
        body.get("nama"),
        body.get("jurusan"),
        body.get("angkatan"),
      ]);
      return Response.redirect("/mahasiswa", 302);
    }

    // FORM EDIT
    if (url.pathname.startsWith("/mahasiswa/edit/")) {
      const id = url.pathname.split("/")[3];
      const [rows]: any = await db.query("SELECT * FROM mahasiswa WHERE id = ?", [id]);
      const m = rows[0];
      let view = fs.readFileSync("./views/mahasiswa/edit.html", "utf8");
      view = view
        .replace("{{id}}", m.id)
        .replace("{{nama}}", m.nama)
        .replace("{{jurusan}}", m.jurusan)
        .replace("{{angkatan}}", m.angkatan);
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // UPDATE DATA
    if (url.pathname.startsWith("/mahasiswa/update/") && req.method == "POST") {
      const id = url.pathname.split("/")[3];
      const body = await req.formData();
      await db.query("UPDATE mahasiswa SET nama = ?, jurusan = ?, angkatan = ? WHERE id = ?", [
        body.get("nama"),
        body.get("jurusan"),
        body.get("angkatan"),
        id,
      ]);
      return Response.redirect("/mahasiswa", 302);
    }

    // HAPUS DATA
    if (url.pathname.startsWith("/mahasiswa/delete/")) {
      const id = url.pathname.split("/")[3];
      await db.query("DELETE FROM mahasiswa WHERE id = ?", [id]);
      return Response.redirect("/mahasiswa", 302);
    }

    return new Response("Not Found", { status: 404 });
  },
});
