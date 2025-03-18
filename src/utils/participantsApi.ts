import { Participant } from "@/app/types/interfaces";

const apiUrl = "/api/participants";

// export const getAllParticipants = async () => {
//   try {
//     const response = await fetch("/api/participants");
//     const resData = await response.json();
//     if (!resData.success) {
//       throw new Error("Cannot get participants");
//     }
//     return resData.data;
//   } catch (error) {
//     console.error("Error fetching participants", error);
//   }
// };
export const getParticipantsByIds = async (ids: string[]) => {
  if (!ids || ids.length === 0) throw new Error("No ids provided");
  const participantIds = ids.join(",");
  try {
    const res = await fetch(`${apiUrl}?ids=${participantIds}`, {
      method: "GET",
    });
    const resData = await res.json();
    if (!resData.success) {
      throw new Error(`Cannot get participants by ids ${ids}`);
    }
    return resData.data;
  } catch (error) {
    console.error(`Error fetching participants by ids ${ids}`, error);
  }
};

export const getParticipantById = async (id: string) => {
  try {
    const response = await fetch(`${apiUrl}/${id}`, { method: "GET" });
    const resData = await response.json();
    if (!resData.success) {
      throw new Error(`Cannot get participant by id ${id}`);
    }
    return resData.data;
  } catch (error) {
    console.error(`Error updating participant by id ${id}`, error);
  }
};

export const createParticipant = async (participantData: Participant) => {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(participantData),
    });

    const resData = await res.json();
    return resData;
  } catch (error) {
    console.error(`Error creating participant`, error);
  }
};

export const updateParticipant = async (participantData: Participant) => {
  try {
    const res = await fetch(`${apiUrl}/${participantData._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(participantData),
    });

    const resData = await res.json();
    return resData;
  } catch (error) {
    console.error(
      `Error updating participant with id ${participantData._id}`,
      error
    );
  }
};

export const deleteParticipant = async (id: string) => {
  try {
    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    const resData = await res.json();
    return resData;
  } catch (error) {
    console.error(`Error deleting participant with id ${id}`, error);
  }
};
