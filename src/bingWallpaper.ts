export const dailyWallpaper = await fetch("https://bing.biturl.top/?resolution=UHD&format=json&index=0&mkt=en-IN").then(async (result) => {
    const wallpaperData = await result.json();
    return wallpaperData;
}).catch((error) => {
    console.log(error)
});