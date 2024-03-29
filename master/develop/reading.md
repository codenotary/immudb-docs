# Reads And Writes

:::tip
Examples in multiple languages can be found at following links: [immudb SDKs examples](https://github.com/codenotary/immudb-client-examples)
:::

Most of the methods in SDKs have `Verified` equivalent, i.e. `Get` and `VerifiedGet`. The only difference is that with `Verified` methods proofs needed to mathematically verify that the data was not tampered are returned by the server and the verification is done automatically by SDKs. 
Note that generating that proof has a slight performance impact, so primitives are allowed without the proof.
It is still possible to get the proofs for a specific item at any time, so the decision about when or how frequently to do checks (with the Verify version of a method) is completely up to the user.
It's possible also to use dedicated [auditors](/production/auditor.md) to ensure the database consistency, but the pattern in which every client is also an auditor is the more interesting one.

## Get and Set

`Get`/`VerifiedGet` and `Set`/`VerifiedSet` methods allow for basic operations on a Key Value level. In addition, `GetAll` and `SetAll` methods allow for adding and reading in a single transaction. See [transactions chapter](transactions.md) for more details.

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
	opts := immudb.DefaultOptions().
		WithAddress("localhost").
		WithPort(3322)

	client := immudb.NewClient().WithOptions(opts)
	err := client.OpenSession(
		context.TODO(),
		[]byte(`immudb`),
		[]byte(`immudb`),
		"defaultdb",
	)
	if err != nil {
		log.Fatal(err)
	}

	defer client.CloseSession(context.TODO())

	// Without verification
	tx, err := client.Set(
		context.TODO(),
		[]byte(`x`),
		[]byte(`y`),
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Set: tx: %d", tx.Id)

	entry, err := client.Get(
		context.TODO(),
		[]byte(`x`),
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Get: %v", entry)

	tx, err = client.SetAll(context.TODO(), &schema.SetRequest{
		KVs: []*schema.KeyValue{
			{Key: []byte(`1`), Value: []byte(`test1`)},
			{Key: []byte(`2`), Value: []byte(`test2`)},
			{Key: []byte(`3`), Value: []byte(`test3`)},
		},
	})
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("SetAll: tx: %d", tx.Id)

	entries, err := client.GetAll(
		context.TODO(),
		[][]byte{
			[]byte(`1`),
			[]byte(`2`),
			[]byte(`3`),
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("GetAll: %+v", entries)

	// With verification
	tx, err = client.VerifiedSet(
		context.TODO(),
		[]byte(`xx`),
		[]byte(`yy`),
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("VerifiedSet: tx: %d", tx.Id)

	entry, err = client.Get(
		context.TODO(),
		[]byte(`xx`),
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("VerifiedGet: %v", entry)
}
```
</TabItem>


<TabItem value="python" label="Python">

```python
from immudb import ImmudbClient
import json

URL = "localhost:3322"  # immudb running on your machine
LOGIN = "immudb"        # Default username
PASSWORD = "immudb"     # Default password
DB = b"defaultdb"       # Default database name (must be in bytes)

def encode(what: str):
    return what.encode("utf-8")

def decode(what: bytes):
    return what.decode("utf-8")

def main():
    client = ImmudbClient(URL)
    client.login(LOGIN, PASSWORD, database = DB)
    
    # You have to operate on bytes
    setResult = client.set(b'x', b'y')
    print(setResult)            # immudb.datatypes.SetResponse
    print(setResult.id)         # id of transaction
    print(setResult.verified)   # in this case verified = False
                                # see Tamperproof reading and writing

    # Also you get response in bytes
    retrieved = client.get(b'x')
    print(retrieved)        # immudb.datatypes.GetResponse
    print(retrieved.key)    # Value is b'x'
    print(retrieved.value)  # Value is b'y'
    print(retrieved.tx)     # Transaction number

    print(type(retrieved.key))      # <class 'bytes'>
    print(type(retrieved.value))    # <class 'bytes'>

    # Operating with strings
    encodedHello = encode("Hello")
    encodedImmutable = encode("Immutable")
    client.set(encodedHello, encodedImmutable)
    retrieved = client.get(encodedHello)

    print(decode(retrieved.value) == "Immutable")   # Value is True

    notExisting = client.get(b'asdasd')
    print(notExisting)                              # Value is None


    # JSON example
    toSet = {"hello": "immutable"}
    encodedToSet = encode(json.dumps(toSet))
    client.set(encodedHello, encodedToSet)

    retrieved = json.loads(decode(client.get(encodedHello).value))
    print(retrieved)    # Value is {"hello": "immutable"}

    # setAll example - sets all keys to value from dictionary
    toSet = {
        b'1': b'test1',
        b'2': b'test2',
        b'3': b'test3'
    }

    client.setAll(toSet)
    retrieved = client.getAll(list(toSet.keys()))
    print(retrieved) 
    # Value is {b'1': b'test1', b'2': b'test2', b'3': b'test3'}


if __name__ == "__main__":
    main()
```

</TabItem>


<TabItem value="java" label="Java">

```java
package io.codenotary.immudb.helloworld;

import io.codenotary.immudb4j.Entry;
import io.codenotary.immudb4j.FileImmuStateHolder;
import io.codenotary.immudb4j.ImmuClient;

public class App {

    public static void main(String[] args) {

        ImmuClient client = null;

        try {

            FileImmuStateHolder stateHolder = FileImmuStateHolder.newBuilder()
                    .withStatesFolder("./immudb_states")
                    .build();

            client = ImmuClient.newBuilder()
                    .withServerUrl("127.0.0.1")
                    .withServerPort(3322)
                    .withStateHolder(stateHolder)
                    .build();

            client.openSession("defaultdb", "immudb", "immudb");

            client.set("myKey", "myValue".getBytes());

            Entry entry = client.get("myKey");

            byte[] value = entry.getValue();

            System.out.format("('%s', '%s')\n", "myKey", new String(value));

            client.closeSession();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (client != null) {
                try {
                    client.shutdown();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }

    }

}
```

Note that `value` is a primitive byte array. You can set the value of a String using:<br/>
`"some string".getBytes(StandardCharsets.UTF_8)`

Also, `set` method is overloaded to allow receiving the `key` parameter as a `byte[]` data type.

</TabItem>


<TabItem value="net" label=".NET">

```csharp
var client = new ImmuClient();
await client.Open("immudb", "immudb", "defaultdb");

await client.Set("k123", "v123");
string v = await client.Get("k123").ToString();

await client.Close();
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

    const setReq: Parameters.Set = { key: 'hello', value: 'world' }
    const setRes = await cl.set(setReq)
    console.log('success: set', setRes)

    const getReq: Parameters.Get = { key: 'hello' }
    const getRes = await cl.get(getReq)
    console.log('success: get', getRes)
})()
```

</TabItem>


<TabItem value="other" label="Others">

If you're using another development language, please refer to the <a href="/connecting/immugw">immugw</a> option.

</TabItem>


</Tabs>

## Get at and since a transaction

You can retrieve a key on a specific transaction with `GetAt`/`VerifiedGetAt`. If you need to check the last value of a key after given transaction (which represent state of the indexer), you can use `GetSince`/`VerifiedGetSince`.

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
	opts := immudb.DefaultOptions().
		WithAddress("localhost").
		WithPort(3322)

	client := immudb.NewClient().WithOptions(opts)
	err := client.OpenSession(
		context.TODO(),
		[]byte(`immudb`),
		[]byte(`immudb`),
		"defaultdb",
	)
	if err != nil {
		log.Fatal(err)
	}

	defer client.CloseSession(context.TODO())

	key := []byte(`123123`)
	var txIDs []uint64
	for _, v := range [][]byte{
		[]byte(`111`),
		[]byte(`222`),
		[]byte(`333`),
	} {
		txID, err := client.Set(
			context.TODO(),
			key,
			v,
		)
		if err != nil {
			log.Fatal(err)
		}
		txIDs = append(txIDs, txID.Id)
	}

	otherTxID, err := client.Set(
		context.TODO(),
		[]byte(`other`),
		[]byte(`other`),
	)
	if err != nil {
		log.Fatal(err)
	}

	// Without verification
	entry, err := client.GetSince(
		context.TODO(),
		key,
		txIDs[0],
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("GetSince first: %+v", entry)

	// With verification
	entry, err = client.VerifiedGetSince(
		context.TODO(),
		key,
		txIDs[0]+1,
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("VerifiedGetSince second: %+v", entry)

	// GetAt txID after inserting other data
	_, err = client.GetAt(
		context.TODO(),
		key,
		otherTxID.Id,
	)
	if err == nil {
		log.Fatalf("This should not happen, %+v", entry)
	}

	// Without verification
	entry, err = client.GetAt(
		context.TODO(),
		key,
		txIDs[1],
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("GetAt second: %+v", entry)

	// With verification
	entry, err = client.VerifiedGetAt(
		context.TODO(),
		key,
		txIDs[2],
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("VerifiedGetAt third: %+v", entry)

	// VerifiedGetAt txID after inserting other data
	entry, err = client.VerifiedGetAt(
		context.TODO(),
		key,
		otherTxID.Id,
	)
	if err == nil {
		log.Fatalf("This should not happen, %+v", entry)
	}
}

```
</TabItem>


<TabItem value="python" label="Python">

```python
from grpc import RpcError
from immudb import ImmudbClient

URL = "localhost:3322"  # immudb running on your machine
LOGIN = "immudb"        # Default username
PASSWORD = "immudb"     # Default password
DB = b"defaultdb"       # Default database name (must be in bytes)

def main():
    client = ImmudbClient(URL)
    client.login(LOGIN, PASSWORD, database = DB)
    first = client.set(b'justfirsttransaction', b'justfirsttransaction')

    key = b'123123'

    first = client.set(key, b'111')
    firstTransaction = first.id

    second = client.set(key, b'222')
    secondTransaction = second.id

    third = client.set(key, b'333')
    thirdTransaction = third.id

    print(client.verifiedGetSince(key, firstTransaction))   # b"111"
    print(client.verifiedGetSince(key, firstTransaction + 1))   # b"222"

    try:
        # This key wasn't set on this transaction
        print(client.verifiedGetAt(key, firstTransaction - 1))
    except RpcError as exception:
        print(exception.debug_error_string())
        print(exception.details())

    verifiedFirst = client.verifiedGetAt(key, firstTransaction) 
                                    # immudb.datatypes.SafeGetResponse
    print(verifiedFirst.id)         # id of transaction
    print(verifiedFirst.key)        # Key that was modified
    print(verifiedFirst.value)      # Value after this transaction
    print(verifiedFirst.refkey)     # Reference key
									# (Queries And History -> setReference)
    print(verifiedFirst.verified)   # Response is verified or not
    print(verifiedFirst.timestamp)  # Time of this transaction

    print(client.verifiedGetAt(key, secondTransaction))
    print(client.verifiedGetAt(key, thirdTransaction))

    try:
        # Transaction doesn't exists yet
        print(client.verifiedGetAt(key, thirdTransaction + 1))
    except RpcError as exception:
        print(exception.debug_error_string())
        print(exception.details())

if __name__ == "__main__":
    main()

```
</TabItem>


<TabItem value="java" label="Java">

```java
package io.codenotary.immudb.helloworld;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import io.codenotary.immudb4j.Entry;
import io.codenotary.immudb4j.FileImmuStateHolder;
import io.codenotary.immudb4j.ImmuClient;
import io.codenotary.immudb4j.TxHeader;

public class App {

    public static void main(String[] args) {

        ImmuClient client = null;

        try {

            FileImmuStateHolder stateHolder = FileImmuStateHolder.newBuilder()
                    .withStatesFolder("./immudb_states")
                    .build();

            client = ImmuClient.newBuilder()
                    .withServerUrl("127.0.0.1")
                    .withServerPort(3322)
                    .withStateHolder(stateHolder)
                    .build();

            client.openSession("defaultdb", "immudb", "immudb");

            byte[] key = "key1".getBytes(StandardCharsets.UTF_8);
            byte[] value = new byte[]{1, 2, 3, 4, 5};

            TxHeader hdr = client.set(key, value);

            Entry entry = client.getAtTx(key, hdr.getId());

            System.out.format("('%s', '%s')\n", new String(key), Arrays.toString(entry.getValue()));

            client.closeSession();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (client != null) {
                try {
                    client.shutdown();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }

    }

}
```

</TabItem>


<TabItem value="net" label=".NET">

```csharp
var client = new ImmuClient();
await client.Open("immudb", "immudb", "defaultdb");

byte[] v2 = new byte[] { 0, 1, 2, 3 };

TxHeader hdr2 = await client.VerifiedSet("k2", v2);
Entry ventry2 = await client.VerifiedGet("k2");
Entry e = await client.GetSinceTx("k2", hdr2.Id);
Console.WriteLine(e.ToString());

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
    const { id } = await cl.set({ key: 'key', value: 'value' })

    const verifiedGetAtReq: Parameters.VerifiedGetAt = {
        key: 'key',
        attx: id
    }
    const verifiedGetAtRes = await cl.verifiedGetAt(verifiedGetAtReq)
    console.log('success: verifiedGetAt', verifiedGetAtRes)

    for (let i = 0; i < 4; i++) {
        await cl.set({ key: 'key', value: `value-${i}` })
    }

    const verifiedGetSinceReq: Parameters.VerifiedGetSince = {
        key: 'key',
        sincetx: 2
    }
    const verifiedGetSinceRes = await cl.verifiedGetSince(verifiedGetSinceReq)
    console.log('success: verifiedGetSince', verifiedGetSinceRes)
})()
```

</TabItem>


<TabItem value="other" label="Others">

If you're using another development language, please refer to the <a href="/connecting/immugw">immugw</a> option.

</TabItem>

</Tabs>

## Get at revision

Each historical value for a single key is attached a revision number.
Revision numbers start with 1 and each overwrite of the same key results in
a new sequential revision number assignment.

A negative revision number can also be specified which means the nth historical value,
e.g. -1 is the previous value, -2 is the one before and so on.

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
	opts := immudb.DefaultOptions().
		WithAddress("localhost").
		WithPort(3322)

	client := immudb.NewClient().WithOptions(opts)
	err := client.OpenSession(
		context.TODO(),
		[]byte(`immudb`),
		[]byte(`immudb`),
		"defaultdb",
	)
	if err != nil {
		log.Fatal(err)
	}

	defer client.CloseSession(context.TODO())

	// Use dedicated API call
	entry, err := client.GetAtRevision(
		context.TODO(),
		[]byte("key"),
		-1,
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf(
		"Retrieved entry at revision %d: %s",
		entry.Revision,
		string(entry.Value),
	)

	// Use additional get option
	entry, err = client.Get(
		context.TODO(),
		[]byte("key"),
		immudb.AtRevision(-2),
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf(
		"Retrieved entry at revision %d: %s",
		entry.Revision,
		string(entry.Value),
	)
}
```

</TabItem>


<TabItem value="python" label="Python">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Python sdk github project](https://github.com/codenotary/immudb-py/issues/new)

</TabItem>


<TabItem value="java" label="Java">

```java
package io.codenotary.immudb.helloworld;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import io.codenotary.immudb4j.Entry;
import io.codenotary.immudb4j.FileImmuStateHolder;
import io.codenotary.immudb4j.ImmuClient;
import io.codenotary.immudb4j.TxHeader;

public class App {

    public static void main(String[] args) {

        ImmuClient client = null;

        try {

            FileImmuStateHolder stateHolder = FileImmuStateHolder.newBuilder()
                    .withStatesFolder("./immudb_states")
                    .build();

            client = ImmuClient.newBuilder()
                    .withServerUrl("127.0.0.1")
                    .withServerPort(3322)
                    .withStateHolder(stateHolder)
                    .build();

            client.openSession("defaultdb", "immudb", "immudb");

            byte[] key = "myKey1".getBytes(StandardCharsets.UTF_8);
            byte[] value1 = new byte[]{1, 2, 3, 4, 5};
            byte[] value2 = new byte[]{5, 4, 3, 2, 1};

            client.set(key, value1);
            client.set(key, value2);

            Entry entry1 = client.getAtRevision(key, 1);
            Entry entry2 = client.getAtRevision(key, 2);

            System.out.format("('%s', '%s')@rev%d\n", new String(key), Arrays.toString(entry1.getValue()), 1);
            System.out.format("('%s', '%s')@rev%d\n", new String(key), Arrays.toString(entry2.getValue()), 2);

            client.closeSession();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (client != null) {
                try {
                    client.shutdown();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }

    }

}
```
</TabItem>


<TabItem value="net" label=".NET">

``` csharp
var client = new ImmuClient();
await client.Open("immudb", "immudb", "defaultdb");

string key = "hello";

try
{
    await client.VerifiedSet(key, "immutable world!");
    Entry entry1 = await client.VerifiedGetAtRevision(key, 0);
    Console.WriteLine(entry1.ToString());
    await client.VerifiedSet(key, "immutable world again!");
    Entry entry2 = await client.VerifiedGetAtRevision(key, -1);
    Console.WriteLine(entry2.ToString());
}
catch (VerificationException e)
{
    // VerificationException means Data Tampering detected!
    // This means the history of changes has been tampered.
    Console.WriteLine(e.ToString());
}
await client.Close();
```

</TabItem>


<TabItem value="node.js" label="Node.js">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Node.js sdk github project](https://github.com/codenotary/immudb-node/issues/new)

</TabItem>


<TabItem value="other" label="Others">

If you're using another development language, please refer to the <a href="/connecting/immugw">immugw</a> option.

</TabItem>


</Tabs>

## Get at TXID

It's possible to retrieve all the keys inside a specific transaction.

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
	opts := immudb.DefaultOptions().
		WithAddress("localhost").
		WithPort(3322)

	client := immudb.NewClient().WithOptions(opts)
	err := client.OpenSession(
		context.TODO(),
		[]byte(`immudb`),
		[]byte(`immudb`),
		"defaultdb",
	)
	if err != nil {
		log.Fatal(err)
	}

	defer client.CloseSession(context.TODO())

	setTxFirst, err := client.SetAll(context.TODO(),
		&schema.SetRequest{KVs: []*schema.KeyValue{
			{Key: []byte("key1"), Value: []byte("val1")},
			{Key: []byte("key2"), Value: []byte("val2")},
		}})
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("First txID: %d", setTxFirst.Id)

	// Set keys in another transaction
	setTxSecond, err := client.SetAll(
		context.TODO(),
		&schema.SetRequest{KVs: []*schema.KeyValue{
			{Key: []byte("key1"), Value: []byte("val11")},
			{Key: []byte("key2"), Value: []byte("val22")},
		}})
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Second txID: %d", setTxSecond.Id)

	// Without verification
	tx, err := client.TxByID(
		context.TODO(),
		setTxFirst.Id,
	)
	if err != nil {
		log.Fatal(err)
	}

	for _, entry := range tx.Entries {
		item, err := client.GetAt(
			context.TODO(),
			entry.Key,
			setTxFirst.Id,
		)
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("retrieved: %+v", item)
	}

	// With verification
	tx, err = client.VerifiedTxByID(
		context.TODO(),
		setTxSecond.Id,
	)
	if err != nil {
		log.Fatal(err)
	}

	for _, entry := range tx.Entries {
		item, err := client.VerifiedGetAt(
			context.TODO(),
			entry.Key,
			setTxSecond.Id,
		)
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("retrieved: %+v", item)
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

    keyFirst = b'333'
    keySecond = b'555'

    first = client.set(keyFirst, b'111')
    firstTransaction = first.id

    second = client.set(keySecond, b'222')
    secondTransaction = second.id

    toSet = {
        b'1': b'test1',
        b'2': b'test2',
        b'3': b'test3'
    }

    third = client.setAll(toSet)
    thirdTransaction = third.id

    keysAtFirst = client.txById(firstTransaction)
    keysAtSecond = client.txById(secondTransaction)
    keysAtThird = client.txById(thirdTransaction)

    print(keysAtFirst)  # [b'333']
    print(keysAtSecond) # [b'555']
    print(keysAtThird)  # [b'1', b'2', b'3']


if __name__ == "__main__":
    main()
```

</TabItem>


<TabItem value="java" label="Java">

```java
package io.codenotary.immudb.helloworld;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import io.codenotary.immudb4j.TxEntry;
import io.codenotary.immudb4j.Entry;
import io.codenotary.immudb4j.FileImmuStateHolder;
import io.codenotary.immudb4j.ImmuClient;
import io.codenotary.immudb4j.KVListBuilder;
import io.codenotary.immudb4j.Tx;
import io.codenotary.immudb4j.TxHeader;

public class App {

    public static void main(String[] args) {

        ImmuClient client = null;

        try {

            FileImmuStateHolder stateHolder = FileImmuStateHolder.newBuilder()
                    .withStatesFolder("./immudb_states")
                    .build();

            client = ImmuClient.newBuilder()
                    .withServerUrl("127.0.0.1")
                    .withServerPort(3322)
                    .withStateHolder(stateHolder)
                    .build();

            client.openSession("defaultdb", "immudb", "immudb");

            byte[] key1 = "myKey1".getBytes(StandardCharsets.UTF_8);
            byte[] value1 = new byte[]{1, 2, 3};

            byte[] key2 = "myKey2".getBytes(StandardCharsets.UTF_8);
            byte[] value2 = new byte[]{4, 5, 6};

            KVListBuilder kvListBuilder = KVListBuilder.newBuilder().
                add(key1, value1).
                add(key2, value2);

            TxHeader hdr = client.setAll(kvListBuilder.entries());

            Tx tx = client.txById(hdr.getId());

            for (TxEntry txEntry : tx.getEntries()) {
                System.out.format("'%s'\n", new String(txEntry.getKey()));
            }
            
            client.closeSession();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (client != null) {
                try {
                    client.shutdown();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }

    }

}

```

</TabItem>


<TabItem value="net" label=".NET">

```csharp

var client = new ImmuClient();
await client.Open("immudb", "immudb", "defaultdb");

TxMetadata txMd = null;
try 
{
    txMd = immuClient.VerifiedSet(key, val);
}
catch (VerificationException e) 
{
    Console.WriteLine("A VerificationException occurred.")
}
try 
{
    Tx tx = immuClient.TxById(txMd.id);
} 
catch (Exception e) 
{
    Console.WriteLine("An exception occurred.")
}

await client.Close();
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
    const { id } = await cl.set({ key: 'key', value: 'value' })

    const txByIdReq: Parameters.TxById = { tx: id }
    const txByIdRes = await cl.txById(txByIdReq)
    console.log('success: txById', txByIdRes)
})()
```

</TabItem>


<TabItem value="other" label="Others">

If you're using another development language, please refer to the <a href="/connecting/immugw">immugw</a> option.

</TabItem>


</Tabs>

## Conditional writes

immudb can check additional preconditions before the write operation is made.
Precondition is checked atomically with the write operation.
It can be then used to ensure consistent state of data inside the database.

Following preconditions are supported:

* MustExist - precondition checks if given key exists in the database,
  this precondition takes into consideration logical deletion and data expiration, if the entry was logically deleted or has expired, MustExist precondition for such entry will fail
* MustNotExist - precondition checks if given key does not exist in the database,
  this precondition also takes into consideration logical deletion and data expiration, if the entry was logically deleted or has expired, MustNotExist precondition for such entry will succeed
* NotModifiedAfterTX - precondition checks if given key was not modified after  given transaction id, local deletion and setting entry with expiration data is also considered modification of the entry

In many cases, keys used for constraints will be the same as keys for written entries.
A good example here is a situation when a value is set only if that key does not exist.
This is not strictly required - keys used in constraints do not have to be the same
or even overlap with keys for modified entries. An example would be if only one of
two keys should exist in the database. In such case, the first key will be modified
and the second key will be used for MustNotExist constraint.

A write operation using precondition can not be done in an asynchronous way.
Preconditions are checked twice when processing such requests - first check is done
against the current state of internal index, the second check is done just before
persisting the write and requires up-to-date index.

Preconditions are available on `SetAll`, `Reference` and `ExecAll` operations.

<Tabs groupId="languages">

<TabItem value="go" label="Go" default>

In go sdk, the `schema` package contains convenient wrappers for creating constraint objects,
such as `schema.PreconditionKeyMustNotExist`.

```go
package main

import (
	"context"
	"log"

	"github.com/codenotary/immudb/pkg/api/schema"
	immudb "github.com/codenotary/immudb/pkg/client"
	immuerrors "github.com/codenotary/immudb/pkg/client/errors"
)

func main() {
	opts := immudb.DefaultOptions().
		WithAddress("localhost").
		WithPort(3322)

	client := immudb.NewClient().WithOptions(opts)
	err := client.OpenSession(
		context.TODO(),
		[]byte(`immudb`),
		[]byte(`immudb`),
		"defaultdb",
	)
	if err != nil {
		log.Fatal(err)
	}

	defer client.CloseSession(context.TODO())

	_, err = client.Set(context.TODO(), []byte("key"), []byte("value"))
	if err != nil {
		log.Fatal(err)
	}

	// ensure modification is done atomically when there are concurrent writers

	entry, err := client.Get(context.TODO(), []byte("key"))
	if err != nil {
		log.Fatal(err)
	}

	_, err = client.SetAll(
		context.TODO(),
		&schema.SetRequest{
			KVs: []*schema.KeyValue{{
				Key:   []byte("key"),
				Value: []byte("value2"),
			}},
			Preconditions: []*schema.Precondition{
				schema.PreconditionKeyNotModifiedAfterTX(
					[]byte("key"),
					entry.Tx,
				),
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	// allow setting the key only once

	_, err = client.SetAll(context.TODO(), &schema.SetRequest{
		KVs: []*schema.KeyValue{
			{Key: []byte("key-once"), Value: []byte("val")},
		},
		Preconditions: []*schema.Precondition{
			schema.PreconditionKeyMustNotExist([]byte("key-once")),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	// set only one key in a group of keys

	_, err = client.SetAll(context.TODO(), &schema.SetRequest{
		KVs: []*schema.KeyValue{
			{Key: []byte("key-group-1"), Value: []byte("val1")},
		},
		Preconditions: []*schema.Precondition{
			schema.PreconditionKeyMustNotExist([]byte("key-group-2")),
			schema.PreconditionKeyMustNotExist([]byte("key-group-3")),
			schema.PreconditionKeyMustNotExist([]byte("key-group-4")),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	// check if returned error indicates precondition failure

	_, err = client.SetAll(context.TODO(), &schema.SetRequest{
		KVs: []*schema.KeyValue{
			{Key: []byte("key-missing"), Value: []byte("val")},
		},
		Preconditions: []*schema.Precondition{
			schema.PreconditionKeyMustExist([]byte("key-missing")),
		},
	})
	immuErr := immuerrors.FromError(err)
	if immuErr != nil &&
		immuErr.Code() == immuerrors.CodIntegrityConstraintViolation {
		log.Println("Constraint validation failed")
	}

}
```
</TabItem>


<TabItem value="python" label="Python">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Python sdk github project](https://github.com/codenotary/immudb-py/issues/new)

</TabItem>


<TabItem value="java" label="Java">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Java sdk github project](https://github.com/codenotary/immudb4j)

</TabItem>


<TabItem value="net" label=".NET">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Java sdk github project](https://github.com/codenotary/immudb4j)

</TabItem>


<TabItem value="node.js" label="Node.js">

This feature is not yet supported or not documented.
Do you want to make a feature request or help out? Open an issue on [Node.js sdk github project](https://github.com/codenotary/immudb-node/issues/new)

</TabItem>


<TabItem value="other" label="Others">

If you're using another development language, please refer to the <a href="/connecting/immugw">immugw</a> option.

</TabItem>


</Tabs>
