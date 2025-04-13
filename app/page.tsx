import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from 'next/navigation';

export default function Home() {
    redirect('/zh');
}
