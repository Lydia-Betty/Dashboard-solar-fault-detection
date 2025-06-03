import {connectToDB} from "@/app/lib/utils";
import { Prediction } from "@/app/lib/models";
 
export async function POST(request) {
  try {
    await connectToDB();

    const { docs} = await request.json();

    if (!Array.isArray(docs)) {
      return new Response(
        JSON.stringify({ error: "`predictions` must be an array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const inserted = await Prediction.insertMany(docs);
    
    // 2) Count total docs
    const count = await Prediction.countDocuments();
    if (count > 100) {
      const toDelete = await Prediction
        .find({})
        .sort({ createdAt: 1 })      // oldest first
        .limit(count - 100)
        .select("_id")
        .lean();
      const ids = toDelete.map(d => d._id);
      await Prediction.deleteMany({ _id: { $in: ids } });
    }

    return new Response(JSON.stringify({ insertedCount: inserted.length }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error saving predictions:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  try {
    await connectToDB();
    const all = await Prediction.find().sort({ createdAt: -1 }).limit(100).lean();
    return new Response(JSON.stringify(all), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching predictions:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
