# GO SQL std library

<WrappedSection>

From immudb `v1.1.0` is possible to use go standard library sql interface to query data.

```go
package main

import (
	"context"
	"fmt"
	"log"

	immudb "github.com/codenotary/immudb/pkg/client"
	"github.com/codenotary/immudb/pkg/stdlib"
)

func main() {
	opts := immudb.DefaultOptions()
	opts.Username = "immudb"
	opts.Password = "immudb"
	opts.Database = "defaultdb"

	db := stdlib.OpenDB(opts)
	defer db.Close()

	_, err := db.ExecContext(
		context.TODO(),
		"CREATE TABLE myTable(id INTEGER, name VARCHAR, PRIMARY KEY id)",
	)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.ExecContext(
		context.TODO(),
		"INSERT INTO myTable (id, name) VALUES (1, 'immudb1')",
	)
	if err != nil {
		log.Fatal(err)
	}

	rows, err := db.QueryContext(
		context.TODO(),
		"SELECT * FROM myTable",
	)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	if !rows.Next() {
		log.Fatal("Did not fetch the row")
	}

	var id uint64
	var name string
	err = rows.Scan(&id, &name)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("id: %d\n", id)
	fmt.Printf("name: %s\n", name)
}
```

In alternative is possible to open immudb with a connection string:

```go
package main

import (
	"context"
	"fmt"
	"log"

	"database/sql"

	_ "github.com/codenotary/immudb/pkg/stdlib"
)

func main() {
	db, err := sql.Open(
		"immudb",
		"immudb://immudb:immudb@127.0.0.1:3322/defaultdb?sslmode=disable",
	)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	_, err = db.ExecContext(
		context.TODO(),
		"CREATE TABLE myTable(id INTEGER, name VARCHAR, PRIMARY KEY id)",
	)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.ExecContext(
		context.TODO(),
		"INSERT INTO myTable (id, name) VALUES (1, 'immudb1')",
	)
	if err != nil {
		log.Fatal(err)
	}

	rows, err := db.QueryContext(
		context.TODO(),
		"SELECT * FROM myTable",
	)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	if !rows.Next() {
		log.Fatal("Did not fetch the row")
	}

	var id uint64
	var name string
	err = rows.Scan(&id, &name)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("id: %d\n", id)
	fmt.Printf("name: %s\n", name)
}
```
Available SSL modes are:

* **disable**. SSL is off
* **insecure-verify**. SSL is on but client will not check the server name.
* **require**. SSL is on.

</WrappedSection>