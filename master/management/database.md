# Database management

Multi-database support is included in immudb server. immudb automatically creates an initial database named `defaultdb`.

Managing users and databases requires the appropriate privileges. A user with `PermissionAdmin` rights can manage everything. Non-admin users have restricted access and can only read or write databases to which they have been granted permission.

Each database can be configured with a variety of settings. While some values can be changed at any time (though it may require a database reload to take effect), following ones are fixed and cannot be changed: FileSize, MaxKeyLen, MaxValueLen, MaxTxEntries and IndexOptions.MaxNodeSize.

## Database creation

This example shows how to create a new database and how to write records to it.
To create a new database, use `CreateDatabaseV2` method.

<Tabs groupId="languages">

<TabItem value="go" label="Go" default>
    
    ```go
    package main

    import (
        "context"
        "log"

        "github.com/codenotary/immudb/pkg/api/schema"
        immudb "github.com/codenotary/immudb/pkg/client"
    )

    func main() {
        client := immudb.NewClient()
        ctx := context.Background()

        err := client.OpenSession(ctx,
            []byte(`immudb`),
            []byte(`immudb`),
            "defaultdb",
        )
        if err != nil {
            log.Fatal(err)
        }

        defer client.CloseSession(ctx)

        res, err := client.CreateDatabaseV2(
            ctx,
            "mydb",
            &schema.DatabaseNullableSettings{
                // this setting determines how many
                // transactions can be handled concurrently
                MaxConcurrency: &schema.NullableUint32{Value: 10},
            },
        )
        if err != nil {
            log.Fatal(err)
        }
        log.Print("Database created, server response: ", res)
    }
    ```
</TabItem>


<TabItem value="java" label="Java">
    ```java
    package io.codenotary.immudb.helloworld;

    import io.codenotary.immudb4j.*;

    public class App {

        public static void main(String[] args) {
            FileImmuStateHolder stateHolder = FileImmuStateHolder.newBuilder()
                        .withStatesFolder("./immudb_states")
                        .build();

            ImmuClient client = ImmuClient.newBuilder()
                        .withServerUrl("127.0.0.1")
                        .withServerPort(3322)
                        .withStateHolder(stateHolder)
                        .build();

            client.login("immudb", "immudb");
        
            client.createDatabase("db1");
        }

    }
    ```

</TabItem>


<TabItem value="python" label="Python">

    ```python
    from immudb import ImmudbClient

    URL = "localhost:3322"  # immudb running on your machine
    LOGIN = "immudb"        # Default username
    PASSWORD = "immudb"     # Default password
    DB = b"defaultdb"       # Default database name (must be in bytes)

    def main():
        client = ImmudbClient(URL)
        client.login(LOGIN, PASSWORD, database = DB)

        client.createDatabase("db1")

    if __name__ == "__main__":
        main()
    ```

</TabItem>


<TabItem value="node.js" label="Node.js">

    ```ts
    import ImmudbClient from 'immudb-node'
    import Parameters from 'immudb-node/types/parameters'

    const IMMUDB_HOST = '127.0.0.1'
    const IMMUDB_PORT = '3322'
    const IMMUDB_USER = 'immudb'
    const IMMUDB_PWD = 'immudb'

    const cl = new ImmudbClient({ host: IMMUDB_HOST, port: IMMUDB_PORT });

    (async () => {
        await cl.login({ user: IMMUDB_USER, password: IMMUDB_PWD })

        const createDatabaseReq: Parameters.CreateDatabase = {
            databasename: 'myimmutabledb'
        }

        const createDatabaseRes = await cl.createDatabase(createDatabaseReq)
        console.log('success: createDatabase', createDatabaseRes)
    })()
    ```

</TabItem>


<TabItem value="net" label=".NET">

```csharp
var client = new ImmuClient();
await client.Open("immudb", "immudb", "defaultdb");

var dbName = "mydatabase";
await client.CreateDatabase(dbName);
await client.UseDatabase(dbName);

await client.Close();
```

</TabItem>


<TabItem value="other" label="Others">
If you're using another development language, please refer to the <a href="/connecting/immugw">immugw</a> option.
</TabItem>


</Tabs>

## Listing databases

This example shows how to list existent databases using `DatabaseListV2` method.

<Tabs groupId="languages">

<TabItem value="go" label="Go" default>
    ```go
    package main

    import (
        "context"
        "log"

        immudb "github.com/codenotary/immudb/pkg/client"
    )

    func main() {
        client := immudb.NewClient()
        ctx := context.Background()

        err := client.OpenSession(
            ctx,
            []byte(`immudb`),
            []byte(`immudb`),
            "defaultdb",
        )
        if err != nil {
            log.Fatal(err)
        }

        defer client.CloseSession(ctx)

        res, err := client.DatabaseListV2(ctx)
        if err != nil {
            log.Fatal(err)
        }

        for _, db := range res.Databases {
            log.Printf(
                "database: %s, loaded: %v",
                db.Name,
                db.Loaded,
            )
        }
    }
    ```
</TabItem>


<TabItem value="java" label="Java">

```java
package io.codenotary.immudb.helloworld;

import io.codenotary.immudb4j.*;

public class App {

    public static void main(String[] args) {
        FileImmuStateHolder stateHolder = FileImmuStateHolder.newBuilder()
                    .withStatesFolder("./immudb_states")
                    .build();

        ImmuClient client = ImmuClient.newBuilder()
                    .withServerUrl("127.0.0.1")
                    .withServerPort(3322)
                    .withStateHolder(stateHolder)
                    .build();

        client.login("immudb", "immudb");

        List<String> dbs = client.databases();
        // List of database names
    }

}
```

</TabItem>


<TabItem value="python" label="Python">
This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Python sdk github project](https://github.com/codenotary/immudb-py/issues/new)
</TabItem>


<TabItem value="node.js" label="Node.js">
This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Node.js sdk github project](https://github.com/codenotary/immudb-node/issues/new)
</TabItem>


<TabItem value="net" label=".NET">

```csharp
var client = new ImmuClient();
await client.Open("immudb", "immudb", "defaultdb");

var databases = await client.Databases();
foreach(var database in databases)
{
    Console.WriteLine(database);
}

await client.Close();
```

</TabItem>


<TabItem value="other" label="Others">
If you're using another development language, please refer to the <a href="/connecting/immugw">immugw</a> option.
</TabItem>


</Tabs>

## Database loading/unloading

Databases can be dynamically loaded and unloaded without having to restart the server. After the database is unloaded, all its resources are released. Unloaded databases cannot be queried or written to, but their settings can still be changed.
Upon startup, the immudb server will automatically load databases with the attribute `Autoload` set to true. If a user-created database cannot be loaded successfully, it remains closed, but the server continues to run normally.
As a default, autoloading is enabled when creating a database, but it can be disabled during creation or turned on/off at any time thereafter.

Following example shows how to load and unload a database using `LoadDatabase` and `UnloadDatabase` methods.

<Tabs groupId="languages">

<TabItem value="go" label="Go" default>
    ```go
    package main
    
    import (
        "context"
        "log"

        "github.com/codenotary/immudb/pkg/api/schema"
        immudb "github.com/codenotary/immudb/pkg/client"
    )

    func main() {
        client := immudb.NewClient()
        ctx := context.Background()

        err := client.OpenSession(
            ctx,
            []byte(`immudb`),
            []byte(`immudb`),
            "defaultdb",
        )
        if err != nil {
            log.Fatal(err)
        }
        defer client.CloseSession(ctx)

        unloadRes, err := client.UnloadDatabase(
            ctx,
            &schema.UnloadDatabaseRequest{
                Database: "mydb",
            },
        )
        if err != nil {
            log.Fatal(err)
        }

        log.Print("Database unloaded, server response: ", unloadRes)

        // Do db maintenance - e.g. backup physical files from disk

        loadRes, err := client.LoadDatabase(
            ctx,
            &schema.LoadDatabaseRequest{
                Database: "mydb",
            },
        )
        if err != nil {
            log.Fatal(err)
        }

        log.Print("Database loaded, server response: ", loadRes)
    }
    ```
</TabItem>


<TabItem value="java" label="Java">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Java sdk github project](https://github.com/codenotary/immudb4j/issues/new)

</TabItem>


<TabItem value="python" label="Python">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Python sdk github project](https://github.com/codenotary/immudb-py/issues/new)

</TabItem>


<TabItem value="node.js" label="Node.js">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Node.js sdk github project](https://github.com/codenotary/immudb-node/issues/new)

</TabItem>


<TabItem value="net" label=".NET">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [.Net sdk github project](https://github.com/codenotary/immudb4net/issues/new)

</TabItem>


<TabItem value="other" label="Others">

If you're using another development language, please refer to the <a href="/connecting/immugw">immugw</a> option.

</TabItem>

</Tabs>

## Database settings

Database settings can be individually changed using `UpdateDatabaseV2` method.

Each database can be configured with a variety of settings. While some values can be changed at any time (though it may require a database reload to take effect), following ones are fixed and cannot be changed: FileSize, MaxKeyLen, MaxValueLen, MaxTxEntries and IndexOptions.MaxNodeSize.

Note: Replication settings take effect without the need of reloading the database.

Following example shows how to update database using `UpdateDatabaseV2` method.

<Tabs groupId="languages">

<TabItem value="go" label="Go" default>

    ```go
    package main

    import (
        "context"
        "fmt"
        "log"

        "github.com/codenotary/immudb/pkg/api/schema"
        immudb "github.com/codenotary/immudb/pkg/client"
    )

    func main() {
        client := immudb.NewClient()
        ctx := context.Background()

        err := client.OpenSession(
            ctx,
            []byte(`immudb`),
            []byte(`immudb`),
            "defaultdb",
        )
        if err != nil {
            log.Fatal(err)
        }

        defer client.CloseSession(ctx)

        res, err := client.UpdateDatabaseV2(
            ctx,
            "mydb",
            &schema.DatabaseNullableSettings{
                TxLogCacheSize: &schema.NullableUint32{Value: 1000},
            },
        )
        if err != nil {
            log.Fatal(err)
        }

        fmt.Println("Database settings updated, server response: ", res)
    }

    ```
</TabItem>


<TabItem value="java" label="Java">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Java sdk github project](https://github.com/codenotary/immudb4j/issues/new)

</TabItem>


<TabItem value="python" label="Python">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Python sdk github project](https://github.com/codenotary/immudb-py/issues/new)

</TabItem>


<TabItem value="node.js" label="Node.js">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Node.js sdk github project](https://github.com/codenotary/immudb-node/issues/new)

</TabItem>


<TabItem value="net" label=".NET">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [.Net sdk github project](https://github.com/codenotary/immudb4net/issues/new)

</TabItem>


<TabItem value="other" label="Others">

If you're using another development language, please refer to the <a href="/connecting/immugw">immugw</a> option.

</TabItem>

</Tabs>

## Configuration options

Following main database options are available:

| Name | Type | Description |
|------|------|-------------|
| replicationSettings | Replication Setings | Repliation settings are described below |
| indexSettings | Index Settings | Index settings are described below |
| fileSize | Uint32 | maximum file size of files on disk generated by immudb |
| maxKeyLen | Uint32 | maximum length of keys for entries stored in the database |
| maxValueLen | Uint32 | maximum length of values for entries stored in the database |
| maxTxEntries | Uint32 | maximum number of entries inside one transaction |
| excludeCommitTime | Bool | if set to true, commit time is not added to transaction headers allowing reproducible database state |
| maxConcurrency | Uint32 | max number of concurrent operations on the db |
| maxIOConcurrency | Uint32 | max number of concurrent IO operations on the db |
| txLogCacheSize | Uint32 | size of transaction log cache |
| vLogMaxOpenedFiles | Uint32 | maximum number of open files for payload data |
| txLogMaxOpenedFiles | Uint32 | maximum number of open files for transaction log |
| commitLogMaxOpenedFiles | Uint32 | maximum number of open files for commit log |
| syncFrequency | duration | set the fsync frequency during commit process (default 20ms)
| write-buffer-size | uint32 | set the size of in-memory buffers for file abstractions (default 4194304)
| writeTxHeaderVersion | Uint32 | transaction header version, used for backwards compatibility |
| autoload | Bool | if set to false, do not load database on startup |

Replication settings:

| Name | Type | Description |
|------|------|-------------|
| replica         | Bool   | if true, the database is a replica of another one |
| primaryDatabase | String | name of the database to replicate |
| primaryHost     | String | hostname of the primary immudb instance |
| primaryPort     | Uint32 | tcp port of the primary immudb instance |
| primaryUsername | String | username used to connect to the primary immudb instance |
| primaryPassword | String | password used to connect to the primary immudb instance |

Additional index options:

| Name | Type | Description |
|------|------|-------------|
| flushThreshold | Uint32 | threshold in number of entries between automatic flushes |
| syncThreshold | Uint32 | threshold in number of entries between flushes with sync |
| cacheSize | Uint32 | size of btree node cache |
| maxNodeSize | Uint32 | max size of btree node in bytes |
| maxActiveSnapshots | Uint32 | max number of active in-memory btree snapshots |
| renewSnapRootAfter | Uint64 | threshold in time for automated snapshot renewal during data scans |
| compactionThld | Uint32 | minimum number of flushed snapshots to enable full compaction of the index |
| delayDuringCompaction | Uint32 | extra delay added during indexing when full compaction is in progress |
| nodesLogMaxOpenedFiles | Uint32 | maximum number of files opened for nodes data |
| historyLogMaxOpenedFiles | Uint32 | maximum number of files opened for nodes history |
| commitLogMaxOpenedFiles | Uint32 | maximum number of files opened for commit log |
| flushBufferSize | Uint32 | in-memory buffer size when doing flush operation |
| cleanupPercentage | Float | % of data to be cleaned up from during next automatic flush operation |
