import { json, redirect } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import NewNote, { links as newNoteLinks } from "../components/NewNote";
import NoteList, { links as noteListLinks } from "../components/NoteList";
import { getStoredNotes, storeNotes } from "../data/notes";

const Notes = () => {
  const notes = useLoaderData();

  return (
    <main>
      <NewNote />
      <NoteList notes={notes} />
    </main>
  );
};

export default Notes;

export const loader = async () => {
  const notes = await getStoredNotes();
  if (!notes || notes.length === 0) {
    throw json({ message: "Could not find any notes" }, { status: 404, statusText: "Not Found" });
  }
  return notes;
};

export const CatchBoundary = () => {
  const caughtResponse = useCatch();
  const message = caughtResponse.data?.message || "Data not found";
  return (
    <main>
      <NewNote />
      <p className='info-message'>{message}</p>
    </main>
  );
};

//Runs in the BE
export const action = async ({ request }) => {
  const formData = await request.formData();
  const noteData = Object.fromEntries(formData);

  if (noteData.title.trim().length < 5) {
    return { message: "Invalid title - must be at least 5 characters long" };
  }

  const existingNotes = await getStoredNotes();
  noteData.id = new Date().toISOString();
  const updatedNotes = existingNotes.concat(noteData);
  await storeNotes(updatedNotes);
  return redirect("/notes");
};

export const links = () => {
  return [...newNoteLinks(), ...noteListLinks()];
};
