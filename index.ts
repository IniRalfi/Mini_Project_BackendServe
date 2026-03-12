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

    // =====================
    // DASHBOARD
    // =====================
    if (url.pathname == "/") {
      const [rowsMahasiswa]: any = await db.query("SELECT COUNT(*) as total FROM mahasiswa");
      const [rowsJurusan]: any = await db.query("SELECT COUNT(*) as total FROM jurusan");

      let view = fs.readFileSync("./views/dashboard/index.html", "utf8");
      view = view
        .replace("{{total_mahasiswa}}", rowsMahasiswa[0].total)
        .replace("{{total_jurusan}}", rowsJurusan[0].total);
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // =====================
    // LIST MAHASISWA
    // =====================
    if (url.pathname == "/mahasiswa") {
      const [rows]: any = await db.query(
        `SELECT mahasiswa.id, mahasiswa.nama, jurusan.nama_jurusan, mahasiswa.angkatan
         FROM mahasiswa
         JOIN jurusan ON mahasiswa.jurusan_id = jurusan.id`,
      );

      let table = "";
      rows.forEach((m: any) => {
        table += `
<tr class="text-center">
  <td class="p-2">${m.id}</td>
  <td class="p-2">${m.nama}</td>
  <td class="p-2">${m.nama_jurusan}</td>
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

    // =====================
    // FORM TAMBAH MAHASISWA
    // =====================
    if (url.pathname == "/mahasiswa/create") {
      const [jurusanList]: any = await db.query("SELECT * FROM jurusan");
      let options = "";
      jurusanList.forEach((j: any) => {
        options += `<option value="${j.id}">${j.nama_jurusan}</option>`;
      });

      let view = fs.readFileSync("./views/mahasiswa/create.html", "utf8");
      view = view.replace("{{jurusan_options}}", options);
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // =====================
    // SIMPAN MAHASISWA BARU
    // =====================
    if (url.pathname == "/mahasiswa/store" && req.method == "POST") {
      const body = await req.formData();
      await db.query("INSERT INTO mahasiswa (nama, jurusan_id, angkatan) VALUES (?, ?, ?)", [
        body.get("nama"),
        body.get("jurusan_id"),
        body.get("angkatan"),
      ]);
      return Response.redirect("/mahasiswa", 302);
    }

    // =====================
    // FORM EDIT MAHASISWA
    // =====================
    if (url.pathname.startsWith("/mahasiswa/edit/")) {
      const id = url.pathname.split("/")[3];
      const [rows]: any = await db.query("SELECT * FROM mahasiswa WHERE id = ?", [id]);
      const m = rows[0];

      const [jurusanList]: any = await db.query("SELECT * FROM jurusan");
      let options = "";
      jurusanList.forEach((j: any) => {
        const selected = j.id == m.jurusan_id ? "selected" : "";
        options += `<option value="${j.id}" ${selected}>${j.nama_jurusan}</option>`;
      });

      let view = fs.readFileSync("./views/mahasiswa/edit.html", "utf8");
      view = view
        .replace("{{id}}", m.id)
        .replace("{{nama}}", m.nama)
        .replace("{{angkatan}}", m.angkatan)
        .replace("{{jurusan_options}}", options);

      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // =====================
    // UPDATE MAHASISWA
    // =====================
    if (url.pathname.startsWith("/mahasiswa/update/") && req.method == "POST") {
      const id = url.pathname.split("/")[3];
      const body = await req.formData();
      await db.query("UPDATE mahasiswa SET nama = ?, jurusan_id = ?, angkatan = ? WHERE id = ?", [
        body.get("nama"),
        body.get("jurusan_id"),
        body.get("angkatan"),
        id,
      ]);
      return Response.redirect("/mahasiswa", 302);
    }

    // =====================
    // HAPUS MAHASISWA
    // =====================
    if (url.pathname.startsWith("/mahasiswa/delete/")) {
      const id = url.pathname.split("/")[3];
      await db.query("DELETE FROM mahasiswa WHERE id = ?", [id]);
      return Response.redirect("/mahasiswa", 302);
    }

    // =====================
    // LIST JURUSAN
    // =====================
    if (url.pathname == "/jurusan") {
      const [rows]: any = await db.query("SELECT * FROM jurusan");

      let table = "";
      rows.forEach((j: any) => {
        table += `
<tr class="text-center">
  <td class="p-2">${j.id}</td>
  <td class="p-2">${j.nama_jurusan}</td>
  <td class="p-2">
    <a href="/jurusan/edit/${j.id}" class="text-blue-500">Edit</a>
    <a href="/jurusan/delete/${j.id}" class="text-red-500 ml-2">Delete</a>
  </td>
</tr>`;
      });

      let view = fs.readFileSync("./views/jurusan/index.html", "utf8");
      view = view.replace("{{rows}}", table);
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // =====================
    // FORM TAMBAH JURUSAN
    // =====================
    if (url.pathname == "/jurusan/create") {
      let view = fs.readFileSync("./views/jurusan/create.html", "utf8");
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // =====================
    // SIMPAN JURUSAN BARU
    // =====================
    if (url.pathname == "/jurusan/store" && req.method == "POST") {
      const body = await req.formData();
      await db.query("INSERT INTO jurusan (nama_jurusan) VALUES (?)", [body.get("nama_jurusan")]);
      return Response.redirect("/jurusan", 302);
    }

    // =====================
    // FORM EDIT JURUSAN
    // =====================
    if (url.pathname.startsWith("/jurusan/edit/")) {
      const id = url.pathname.split("/")[3];
      const [rows]: any = await db.query("SELECT * FROM jurusan WHERE id = ?", [id]);
      const j = rows[0];

      let view = fs.readFileSync("./views/jurusan/edit.html", "utf8");
      view = view.replace("{{id}}", j.id).replace("{{nama_jurusan}}", j.nama_jurusan);

      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // =====================
    // UPDATE JURUSAN
    // =====================
    if (url.pathname.startsWith("/jurusan/update/") && req.method == "POST") {
      const id = url.pathname.split("/")[3];
      const body = await req.formData();
      await db.query("UPDATE jurusan SET nama_jurusan = ? WHERE id = ?", [
        body.get("nama_jurusan"),
        id,
      ]);
      return Response.redirect("/jurusan", 302);
    }

    // =====================
    // HAPUS JURUSAN
    // =====================
    if (url.pathname.startsWith("/jurusan/delete/")) {
      const id = url.pathname.split("/")[3];
      await db.query("DELETE FROM jurusan WHERE id = ?", [id]);
      return Response.redirect("/jurusan", 302);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server running at: http://localhost:3000");
