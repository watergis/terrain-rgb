import { test, expect } from "@playwright/test";

test("TerrainRGB Test Results - All OK", async ({ page }) => {
    await page.goto("http://localhost:5173");

    await page.waitForSelector("[data-testid='result']");
    const resultCells = await page.$$eval("[data-testid='result']", cells =>
        cells.map(cell => cell.textContent?.trim())
    );

    resultCells.forEach((result) => {
        expect(result).toBe("✔");
    });
});
