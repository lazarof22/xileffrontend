"use client";

import { Button, Card, TextField } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Button variant="contained" color="primary" onClick={() => router.push('/login')}>Guardar</Button>
    </>
  );
}
