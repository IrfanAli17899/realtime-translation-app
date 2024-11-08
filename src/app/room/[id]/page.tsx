import AuthWrapper from "@/components/auth-wrapper";
import { RoomScreen } from "@/screens/room";
import React from "react";

export interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params;
  return (
    <AuthWrapper>
      <RoomScreen roomId={id} />
    </AuthWrapper>
  );
}
