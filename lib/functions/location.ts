export const getLocation = async () => {
    const allowed = await new Promise((resolve) => {
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
            resolve(result.state === "granted");
        });
    });
    if (!allowed) {
        return {
            coords: {
                latitude: 14.5995,
                longitude: 120.9842,
            },
        };
    }
    return navigator.geolocation.getCurrentPosition(
        (position) => {
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
        },
        (error) => {
            return {
                latitude: 14.5995,
                longitude: 120.9842,
            };
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        },
    );
};
