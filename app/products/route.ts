const BACKEND = "http://localhost:3001";

export async function GET() {
  const res = await fetch(`${BACKEND}/products`);
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const res = await fetch(`${BACKEND}/products`, {
    method: "POST",
    body:   formData,
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}