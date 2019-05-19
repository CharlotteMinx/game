var $ = function(sel) {return document.querySelectorAll(sel)};
var $$ = function(sel) {return document.querySelector(sel)};



var btn_add = $$("#btn_add");

var add_options = $$("#add_options");
var btn_add_msg = $$("#btn_add_msg");
var btn_add_rcp = $$("#btn_add_rcp");
var btn_add_key = $$("#btn_add_key");

var message_area = $$("#user_msg");
var destinations = $$("#destinations");
var keys;

var addables = [message_area, destinations];

btn_add.addEventListener("click", function(event) {
  add_options.classList.toggle("hidden");
});

btn_add_msg.addEventListener("click", function(event) {
  hideall(addables);
  message_area.classList.remove("hidden");
});

btn_add_rcp.addEventListener("click", function(event) {
  hideall(addables);
  destinations.classList.remove("hidden");
});


function hideall(list: Array) {
  list.forEach(function(item) {
    item.classList.add("hidden");
  });
}

enum EnvProperty {
    MSG,
    ADS,
    KEY,
}

class Envelope {
    message: string;
    address: string;
    key: Key;

    add(prop: EnvProperty, content) {
        switch (prop) {
            case EnvProperty.MSG:
                this.message = content;
                break;
            case EnvProperty.ADS:
                this.address = content;
                break;
            case EnvProperty.KEY:
                this.key = content;
                break;
            default:
                console.log("Bad property");
                break;
        }
    }

    toString() {
        console.log("\nThis envelope contains:\n");

        
        console.log(this.message);
        console.log(this.address);
        
        var keyinfo = (this.key === undefined) ? "none" : this.key.toString();
        console.log(keyinfo);
    }
}

class Key {
    isPublic: boolean;
    owner: string;
    color: string;

    constructor( isPublic, owner, color ) {
        this.isPublic = isPublic;
        this.owner = owner;
        this.color = color;
    }

    toString() {
        console.log(this.isPublic + "\n" + this.owner + "\n" + this.color);
    }
}