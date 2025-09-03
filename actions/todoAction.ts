"use server";
import { todo } from "@/db/schema";
import { db } from "@/lib/db";

export const getData = async () => {
    const data = await db.select().from(todo);
    return data;
};

export const addTodo = async (id: number, text: string) => {
    await db.insert(todo).values({
        id: id,
        text: text,
    });
};

