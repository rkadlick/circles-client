import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../auth/supabaseClient";

// Create Circle Action
export const createCircle = createAsyncThunk(
	"circles/createCircle",
	async ({
	  name,
	  description,
	  created_by,
	}: {
	  name: string;
	  description: string;
	  created_by: string;
	}) => {
	  const { data, error } = await supabase
		.from("circles")
		.insert([{ name, description, created_by }])
		.select('*');
	  if (error) throw new Error(error.message);
	  return data;
	}
  );
  
  // Check Circle Exists Action
  export const checkCircleExists = createAsyncThunk(
	"circles/checkCircleExists",
	async (circleName: string) => {
	  if (!circleName) return false; // Prevent unnecessary requests
	  //console.log(circleName)
	  const { data, error } = await supabase
		.from("circles")
		.select("id, name, description")
		.eq("name", circleName)
		.maybeSingle();
	  if (error) {
		  console.error("Error fetching circle:", error.message);
		  return false; // Return false if there's an error
		}
	  return data;
	}
  );
  
  // Fetch CircleId by name
  export const fetchCircleIdByName = createAsyncThunk(
	"circles/fetchCircleIdByName",
	async (circleName: string) => {
	  //console.log('test')
	  if (!circleName) return false; // Prevent unnecessary requests
	  const { data, error } = await supabase
		.from("circles")
		.select("id, description")
		.eq("name", circleName)
		.single();
	  if (error) throw new Error(error.message);
	  return data;
	}
  );
  
  export const userJoinCircle = createAsyncThunk(
	"circles/userJoinCircle",
	async ({ userId, circleId, circleName }: { userId: string; circleId: string; circleName: string }) => {
	  const { data, error } = await supabase
		.from('user_circles')
		.insert([{ user_id: userId, circle_id: circleId }]); // Insert the join row
  
	  if (error) throw new Error(error.message);
	  
	  return { name: circleName };
	}
  )
  
  export const userLeaveCircle = createAsyncThunk(
	"circles/userLeaveCircle",
	async ({ userId, circleId, circleName }: { userId: string; circleId: string; circleName: string; }) => {
	  const { data, error } = await supabase
	  .from('user_circles')
	  .delete()
	  .eq('user_id', userId)
	  .eq('circle_id', circleId); // Remove the join row
  
	  if (error) throw new Error(error.message);
	  return {name: circleName};
	});
  
	export const fetchUserCircles = createAsyncThunk(
	  "circles/fetchUserCircles",
	  async (userId: string) => {
		const { data, error } = await supabase
		  .from("user_circles")
		  .select("circles(name)")
		  .eq("user_id", userId);
	
		if (error) throw new Error(error.message);
		
		// Extract the circle names from the data
		const circleNames = data.map((entry: any) => entry.circles.name);
		return circleNames;
	  }
	);
	