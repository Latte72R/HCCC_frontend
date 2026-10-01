# HCCC frontend

## GHCRの最新imageに更新

更新して再起動
```
kubectl -n hccc rollout restart deployment/web-server
kubectl -n hccc rollout restart deployment/judge-server
kubectl -n hccc rollout restart deployment/frontend
```
完了の確認
```
kubectl -n hccc rollout status deployment/web-server --timeout=300s
kubectl -n hccc rollout status deployment/judge-server --timeout=300s
kubectl -n hccc rollout status deployment/frontend --timeout=300s
```

## 開発方法

Node.js 24 で開発します。

```bash
npm ci
npm run dev
```

開発時は backend を `localhost:55301` で起動します。別の URL を使う場合は
`HCCC_API_INTERNAL_URL` を Next.js サーバーに設定してください。
ブラウザからの API 呼び出しは `/api/backend` を経由します。

```bash
npm run type:check
npm run lint
npm run build
```

管理画面は `/admin` にあります。権限は backend の `ADMIN_USER_IDS` で設定します。
管理者は提出詳細を開き、直近の提出の判定とエラーメッセージを修正できます。
