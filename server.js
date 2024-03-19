const express = require("express");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

// Swaggerドキュメントを読み込む
const norDocument = JSON.parse(fs.readFileSync(path.join(__dirname, "rest-api-specs", "/nor1/publishedUpsellOffers.json"), "utf8"));

// トップページのルート
app.get("/", (req, res) => {
    res.send(`
        <h1>Swagger UI App</h1>
        <ul>
            <li><a href="/nor">/nor/publishedUpsellOffers</a></li>
            <li><a href="/property">property</a></li>
        </ul>
    `);
});

const readSwaggerFiles = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            readSwaggerFiles(filePath, fileList);
        } else if (filePath.endsWith(".json")) {
            // 拡張子が.jsonのファイルのみを対象にする
            fileList.push(filePath);
        }
    });

    return fileList;
};

// 例えば、/propertyディレクトリ内のSwaggerファイルに対してパスを設定
const propertySwaggerFiles = readSwaggerFiles(path.join(__dirname, "rest-api-specs", "property"));
const hrefList = [];

propertySwaggerFiles.forEach((swaggerFilePath) => {
    // ファイルパスからエンドポイントのパスを生成（例: /property/act）
    const endpoint = swaggerFilePath
        .replace(__dirname, "") // ベースディレクトリを削除
        .replace(/\\/g, "/") // Windows環境のパス区切り文字を修正
        .replace("/rest-api-specs", "") // 不要なパス部分を削除
        .replace(".json", ""); // 拡張子を削除

    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, "utf8"));
    hrefList.push(endpoint);

    app.use(endpoint, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
});

app.get("/property", (req, res) => {
    res.send(`
        <h1>Swagger UI App property</h1>
        <ul>
            ${hrefList
                .map((src) => {
                    return `<li><a href=${src}>${src}</a></li>`;
                })
                .join("")}
        </ul>
    `);
});
// Swagger UIの設定
app.use("/nor", swaggerUi.serve, swaggerUi.setup(norDocument));

// サーバーを起動する
app.listen(port, () => {
    console.log(`Swagger UI app listening at http://localhost:${port}`);
});
