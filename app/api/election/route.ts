import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

export async function POST(request: NextRequest) {
  if (!apiUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Election API URL is not configured.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
      redirect: "follow",
      cache: "no-store",
    });

    const responseText = await response.text();

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data, { status: response.status });
    } catch {
      console.error("Apps Script returned non-JSON:", responseText);

      return NextResponse.json(
        {
          success: false,
          message:
            "The Google Apps Script deployment returned an invalid response. Update the deployment to a new version.",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Election API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to communicate with the election server.",
      },
      { status: 500 }
    );
  }
}