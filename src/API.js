export const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJjNDJkNWQwMi05YmNjLTQyNWItOTMwYi01ZGZiOTE3ODhhYWEiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY1NDA1OTA1NiwiZXhwIjoxNjU0NjYzODU2fQ.66HMumW4lPevUUr0yvY8LPFHpO5MFM-AAEcMBjpy5bY";

export const createMeeting = async ({ token }) => {
    const res = await fetch(`https://api.videosdk.live/v1/meetings`, {
        method: "POST",
        headers: {
            authorization: `${authToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ region: "sg001" }),
    });

    const { meetingId } = await res.json();
    return meetingId;
}

export const fetchHlsDownstreamUrl = async ({ meetingId }) => {
    const res = await fetch (
        `https://api.videosdk.live/v2/hls/?roomId=${meetingId}`,
        {
            method: "GET",
            headers: {
                authorization: `${authToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    const json = await res.json()
    const { downstreamUrl } = json?.data[0];
    return downstreamUrl

}