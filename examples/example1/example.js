$(function () {
    var viewModel = {
        isBusy1: ko.observable(false),
        isBus1y2: ko.observable(false),
        isEnabled: ko.observable(true)
    };
    viewModel.onClick = function () {
        viewModel.isBusy1(true);
        viewModel.isEnabled(false);
        setTimeout(function () {
            viewModel.isBusy1(false);
            viewModel.isEnabled(true);
        }, 10000);
    };
    ko.applyBindings(viewModel);
});