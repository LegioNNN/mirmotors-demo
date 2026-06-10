$path = "C:\Users\ahmet\Desktop\Sancaktar\sancaktar\src\components\ui\CarCard.tsx"
$bytes = [System.IO.File]::ReadAllBytes($path)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# 1. Add Link import
$old1 = 'import { useState } from "react";'
$new1 = 'import { useState } from "react";' + "`r`n" + 'import Link from "next/link";'
$content = $content.Replace($old1, $new1)

# 2. Replace Incele button with Link
$old2 = '<button type="button" className="flex-1 rounded-lg bg-[#111827] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800">'
$new2Start = '<Link href={`/ilan/$'
$new2Mid = '{car.id}`} className="flex-1 rounded-lg bg-[#111827] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800 text-center block">'
$new2 = $new2Start + $new2Mid
$content = $content.Replace($old2, $new2)
$content = $content.Replace("</button>", "</Link>")

[System.IO.File]::WriteAllBytes($path, [System.Text.Encoding]::UTF8.GetBytes($content))
Write-Host "Done"
